import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { TimeRangeType } from "@/types/dataModels";

interface DataFilterBarProps {
  timeRange: TimeRangeType;
  onTimeRangeChange: (range: TimeRangeType) => void;
  onDateRangeConfirm: (startDate: Date, endDate: Date) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const DataFilterBar = ({
  timeRange,
  onTimeRangeChange,
  onDateRangeConfirm,
  isLoading,
  onRefresh
}: DataFilterBarProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const handleDateRangeConfirm = () => {
    if (startDate && endDate) {
      onDateRangeConfirm(startDate, endDate);
      setDatePickerOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
        <Button 
          variant={timeRange === 'today' ? "default" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => onTimeRangeChange('today')}
        >
          今日
        </Button>
        <Button 
          variant={timeRange === 'week' ? "default" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => onTimeRangeChange('week')}
        >
          本周
        </Button>
        <Button 
          variant={timeRange === 'month' ? "default" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => onTimeRangeChange('month')}
        >
          本月
        </Button>
        <Button 
          variant={timeRange === 'last_month' ? "default" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => onTimeRangeChange('last_month')}
        >
          上月
        </Button>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={timeRange === 'custom' ? "default" : "ghost"}
              size="sm"
              className="h-8 flex items-center gap-1"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              自定义
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">开始日期</span>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">结束日期</span>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </div>
                <div>
                  <Button className="w-full" onClick={handleDateRangeConfirm}>确认</Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        className="ml-auto h-8"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="mr-1">加载中</span>
            <span className="animate-spin">⟳</span>
          </>
        ) : '刷新数据'}
      </Button>
    </div>
  );
};

export default DataFilterBar;
