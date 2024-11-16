export interface WeekSelectorProps {
    selectedWeek: 'current' | number;
    onChange: (week: 'current' | number) => void;
} 