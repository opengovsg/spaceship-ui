import { TabBar, TabBarItem } from "./tab-bar";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  hidden?: boolean;
}
interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (key: T) => void;
  className?: string;
}

/** Data-driven composition of the canonical keyboard-accessible tab bar. */
export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabsProps<T>) {
  return (
    <TabBar
      value={activeTab}
      onChange={(value) => onTabChange(value as T)}
      className={className}
    >
      {tabs
        .filter((tab) => !tab.hidden)
        .map((tab) => (
          <TabBarItem key={tab.key} value={tab.key}>
            {tab.label}
          </TabBarItem>
        ))}
    </TabBar>
  );
}
