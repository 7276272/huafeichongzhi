import React from 'react';
import { DataText } from './DataDisplayFix';
import { FileBarChart } from 'lucide-react';

/**
 * u6570u636eu56feu8868u7a7au72b6u6001u663eu793au7ec4u4ef6
 * u7528u4e8eu663eu793au6ca1u6709u6570u636eu65f6u7684u63d0u793au4fe1u606f
 */
export const EmptyDataView: React.FC<{
  message: string;
  className?: string;
}> = ({ message, className = '' }) => {
  return (
    <div className={`h-full flex flex-col items-center justify-center text-gray-400 ${className}`}>
      <FileBarChart className="h-10 w-10 mb-2 opacity-50" />
      <DataText text={message} />
    </div>
  );
};
