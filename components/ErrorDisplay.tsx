import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);


const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative max-w-lg mx-auto" role="alert">
        <div className="flex items-center">
            <AlertIcon className="w-8 h-8 mr-4 text-red-400"/>
            <div>
                <strong className="font-bold block">An error occurred</strong>
                <span className="block sm:inline">{message}</span>
            </div>
        </div>
    </div>
  );
};

export default ErrorDisplay;
