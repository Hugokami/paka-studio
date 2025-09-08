import React from 'react';

interface LoaderProps {
  message?: string;
  progress?: number;
}

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);


const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', progress }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 w-full max-w-md">
      <div className="relative w-24 h-24">
        <CameraIcon className="w-24 h-24 text-sky-500/30" />
        <CameraIcon className="w-24 h-24 absolute top-0 left-0 text-sky-400 animate-pulse" />
      </div>
      <p className="text-lg font-semibold text-gray-300 animate-ellipsis">{message}</p>
      {progress !== undefined && (
          <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }}></div>
          </div>
      )}
    </div>
  );
};

export default Loader;