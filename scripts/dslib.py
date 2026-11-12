#!/usr/bin/env python3
"""Helper for the lab-design-library skill. Only the exact, testable work lives here.

inventory  List the DS files and whether app code outside the DS imports them (directly,
           through a barrel, or through another used DS file).
registry   Build registry.json (shadcn format) from a library's registry/ folder.
check      Compare the app's DS folder with the library's registry/ folder. Exit 1 on any difference.
"""
import argparse
import json
import re
import sys
from pathlib import Path

CODE = ('.ts', '.tsx')
SHIPPED = CODE + ('.css', '.json', '.svg', '.md')
SKIP = ('.stories.', '.test.', '.spec.')
SKIP_DIRS = {'__tests__', 'node_modules', 'examples'}
# `from "x"`, `import "x"` and `export ... from "x"`
IMPORT = re.compile(r'''(?:from|import)\s+["']([^"']+)["']''')
TYPES = {'ui': 'registry:ui', 'patterns': 'registry:block', 'lib': 'registry:lib', 'tokens': 'registry:style'}


def shipped(p, root):
    rel = p.relative_to(root)
    return (p.is_file() and p.suffix in SHIPPED and not any(s in p.name for s in SKIP)
            and not SKIP_DIRS.intersection(rel.parts))


def files_under(root):
    return sorted(p for p in root.rglob('*') if shipped(p, root))


def resolve(base, spec):
    """Files an import could point at, given the folder it is relative to."""
    target = (base / spec.split('?')[0]).resolve()  # `icon.svg?react` is the file icon.svg
    hits = [target] + [target.with_name(target.name + s) for s in CODE] + [target / f'index{s}' for s in CODE]
    return [h for h in hits if h.is_file()]


def imports_of(f, ds, alias):
    """DS files that f imports, by relative path or by the DS alias."""
    out = []
    for spec in IMPORT.findall(f.read_text(errors='ignore')):
        if spec.startswith('.'):
            out += resolve(f.parent, spec)
        elif spec == alias or spec.startswith(alias + '/'):
            out += resolve(ds, '.' + spec[len(alias):])
    return out


def cmd_inventory(a):
    app = Path(a.app).resolve()
    ds = (app / a.ds).resolve()
    todo = []
    for f in app.rglob('*'):
        if f.is_file() and f.suffix in CODE and 'node_modules' not in f.parts and ds not in f.parents:
            todo += [h for h in imports_of(f, ds, a.alias) if ds in h.parents]
    used = set()
    while todo:  # follow DS-to-DS imports, barrels included
        f = todo.pop()
        if f in used:
            continue
        used.add(f)
        if f.suffix in CODE:
            todo += [h for h in imports_of(f, ds, a.alias) if ds in h.parents]
    rows = [{'path': str(p.relative_to(ds)), 'used': p in used, 'leaks': leaks_of(p, a.alias)}
            for p in files_under(ds) if p.suffix in CODE and p.stem != 'index']
    if a.json:
        print(json.dumps(rows, indent=2))
        return 0
    for r in rows:
        print(f"{'used  ' if r['used'] else 'UNUSED'}  {r['path']}")
    leaks = {}
    for r in rows:
        for s in r['leaks'] if r['used'] else ():
            leaks.setdefault(s, []).append(r['path'])
    if leaks:
        print('\nDS files that import app code outside the DS (must move into the library or become props):')
        for spec, paths in sorted(leaks.items(), key=lambda kv: (len(kv[1]), kv[0])):
            where = paths[0] if len(paths) == 1 else f'{len(paths)} files, e.g. {paths[0]}'
            print(f'LEAKS  {spec}  ({where})')
    print(f"\n{sum(r['used'] for r in rows)} used, {sum(not r['used'] for r in rows)} unused, "
          f"{len(leaks)} leaked app modules")
    return 0


def leaks_of(f, alias):
    """Imports of app code outside the DS, through the app's root alias (e.g. '#/' when the DS is '#/components/ds')."""
    root = alias.split('/')[0] + '/'
    return sorted({s for s in IMPORT.findall(f.read_text(errors='ignore'))
                   if s.startswith(root) and s != alias and not s.startswith(alias + '/')})


def kebab(name):
    name = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '-', name)
    return re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-').lower()


def package_of(spec):
    parts = spec.split('/')
    return '/'.join(parts[:2]) if spec.startswith('@') else parts[0]


def cmd_registry(a):
    lib = Path(a.lib).resolve()
    reg_dir = lib / 'registry'
    home = a.homepage.rstrip('/')
    groups = {}  # item name -> (type, [files])
    for kind in TYPES:
        top = reg_dir / kind
        if not top.is_dir():
            continue
        for entry in sorted(top.iterdir()):
            if entry.is_dir():
                files = files_under(entry)
            elif shipped(entry, top) and entry.suffix in CODE + ('.css',):
                files = [entry]
            else:
                continue
            if not files:
                continue
            name, typ = kebab(entry.stem if entry.is_file() else entry.name), TYPES[kind]
            if entry.is_file() and entry.stem == 'index':
                name, typ = f'{kind}-index', 'registry:lib'  # each folder's barrel is its own item
            elif entry.is_file() and entry.suffix == '.ts' and kind in ('ui', 'patterns'):
                typ = 'registry:hook' if name.startswith('use-') else 'registry:lib'  # no JSX, no demo
            if name in groups:
                sys.exit(f'Two registry items would be named "{name}". Rename one of them.')
            groups[name] = (typ, files)
    # Files outside the typed folders still have to reach the app, or `check` reports them missing.
    if (reg_dir / 'icons').is_dir() and files_under(reg_dir / 'icons'):
        groups['icons'] = ('registry:file', files_under(reg_dir / 'icons'))
    root_files = [p for p in sorted(reg_dir.iterdir()) if shipped(p, reg_dir)]
    if root_files:
        groups['ds-root'] = ('registry:file', root_files)
    owner = {f: name for name, (_, fs) in groups.items() for f in fs}
    items = []
    for name, (typ, files) in groups.items():
        deps, reg_deps = set(), set()
        for f in files:
            if f.suffix not in CODE:
                continue
            for spec in IMPORT.findall(f.read_text(errors='ignore')):
                if spec.startswith('.') or spec == a.lib_alias or spec.startswith(a.lib_alias + '/'):
                    base = f.parent if spec.startswith('.') else reg_dir
                    rel = spec if spec.startswith('.') else '.' + spec[len(a.lib_alias):]
                    for hit in resolve(base, rel):
                        if owner.get(hit, name) != name:
                            reg_deps.add(f'{home}/r/{owner[hit]}.json')
                elif package_of(spec) not in ('react', 'react-dom', 'next') and not spec.startswith(('#', '~', '@/')):
                    deps.add(package_of(spec))
        items.append({
            'name': name,
            'type': typ,
            'title': files[0].stem if len(files) == 1 else name.replace('-', ' ').title(),
            'dependencies': sorted(deps),
            'registryDependencies': sorted(reg_deps),
            'files': [{'path': str(f.relative_to(lib)), 'type': 'registry:file',
                       'target': f"{a.target_root.rstrip('/')}/{f.relative_to(reg_dir)}"} for f in files],
        })
    reg = {'$schema': 'https://ui.shadcn.com/schema/registry.json', 'name': a.name, 'homepage': home, 'items': items}
    (lib / 'registry.json').write_text(json.dumps(reg, indent=2) + '\n')
    examples = {p.stem for p in (reg_dir / 'examples').glob('*.tsx')} if (reg_dir / 'examples').is_dir() else set()
    shown = sorted(examples & {i['name'] for i in items})
    (lib / 'examples.generated.tsx').write_text(
        '"use client";\n// Generated by dslib.py registry. Do not edit.\n'
        'import dynamic from "next/dynamic";\nimport type { ComponentType } from "react";\n\n'
        'export const examples: Record<string, ComponentType> = {\n'
        + ''.join(f'  "{n}": dynamic(() => import("./registry/examples/{n}")),\n' for n in shown)
        + '};\n')
    for i in items:
        if i['name'] not in examples and i['type'] in ('registry:ui', 'registry:block'):
            print(f"NO EXAMPLE  {i['name']}")
    print(f'{len(items)} items written to registry.json')
    return 0


def cmd_check(a):
    app_root, lib_root = Path(a.app_ds), Path(a.lib)
    app = {str(p.relative_to(app_root)): p for p in files_under(app_root)} if app_root.is_dir() else {}
    lib = {str(p.relative_to(lib_root)): p for p in files_under(lib_root)} if lib_root.is_dir() else {}
    lines = []
    for rel in sorted(app.keys() | lib.keys()):
        if rel not in lib:
            lines.append(f'APP ONLY  {rel}')
        elif rel not in app:
            lines.append(f'LIB ONLY  {rel}')
        elif app[rel].read_text(errors='ignore') != lib[rel].read_text(errors='ignore').replace(a.lib_alias, a.app_alias):
            lines.append(f'DRIFT  {rel}')
    print('\n'.join(lines) if lines else 'in sync')
    return 1 if lines else 0


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest='cmd', required=True)

    i = sub.add_parser('inventory', help='which DS files the app uses')
    i.add_argument('--app', required=True, help='app repo root')
    i.add_argument('--ds', required=True, help='DS folder, relative to --app (e.g. src/components/ds)')
    i.add_argument('--alias', required=True, help='import prefix for the DS folder (e.g. #/components/ds)')
    i.add_argument('--json', action='store_true')
    i.set_defaults(func=cmd_inventory)

    r = sub.add_parser('registry', help='write registry.json')
    r.add_argument('--lib', required=True, help='library repo root (holds registry/)')
    r.add_argument('--name', required=True)
    r.add_argument('--homepage', required=True, help='docs site URL; installs pull <homepage>/r/<name>.json')
    r.add_argument('--lib-alias', required=True, help='import prefix the library uses for registry/')
    r.add_argument('--target-root', required=True, help="where files land in the app (the app's DS folder)")
    r.set_defaults(func=cmd_registry)

    c = sub.add_parser('check', help='compare app DS with library')
    c.add_argument('--app-ds', required=True, help="the app's DS folder")
    c.add_argument('--lib', required=True, help="the library's registry/ folder")
    c.add_argument('--app-alias', required=True)
    c.add_argument('--lib-alias', required=True)
    c.set_defaults(func=cmd_check)

    a = p.parse_args(argv)
    return a.func(a)


if __name__ == '__main__':
    sys.exit(main())
