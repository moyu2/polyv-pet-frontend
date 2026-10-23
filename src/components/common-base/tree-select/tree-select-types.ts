export type TreeSelectDataValue = string | number;

export type TreeSelectChild = {
  label: string;
  value: TreeSelectDataValue;
  disabled?: boolean;
};

export type TreeSelectItem = {
  label: string;
  value: TreeSelectDataValue;
  children?: TreeSelectChild[];
  disabled?: boolean;
  className?: unknown;
};
