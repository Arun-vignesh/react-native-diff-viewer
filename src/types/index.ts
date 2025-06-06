export interface DiffViewerTheme {
  backgroundColor?: string;
  textColor?: string;
  diffAddedColor?: string;
  diffRemovedColor?: string;
  diffUnchangedColor?: string;
  diffChangedColor?: string;
}

export interface DiffViewerProps {
  /**
   * The new/modified configuration object to compare
   */
  data1: unknown;
  
  /**
   * The old/original configuration object to compare against
   */
  data2: unknown;
  
  /**
   * Optional theme customization
   */
  theme?: DiffViewerTheme;

  /**
   * Custom title for the left panel (original version)
   * @default "Original Version"
   */
  oldVersionTitle?: string;

  /**
   * Custom title for the right panel (modified version)
   * @default "Modified Version"
   */
  newVersionTitle?: string;
}

export interface LogFileManagerProps {
  auditLog: Record<string, Array<{
    id: string | number;
    date: string;
    loggedInStaff?: string;
    data: any;
    type: string;
  }>>;
  onItemClick?: (item: any) => void;
  dateTimeFormat?: string;
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    headerBackgroundColor?: string;
    dividerColor?: string;
  };
  leftTitle?: string;
  rightTitle?: string;
  icons?: {
    userIcon?: string;
    clockIcon?: string;
    calendarIcon?: string;
    arrowRightIcon?: string;
    leftViewIcon?: string;
    rightViewIcon?: string;
  };
} 