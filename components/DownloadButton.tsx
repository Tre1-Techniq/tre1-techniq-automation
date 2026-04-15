'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface DownloadButtonProps {
  title: string
}

export default function DownloadButton({ title }: DownloadButtonProps) {
  const handleDownload = () => {
    alert(`Downloading: ${title}\n\nThis would trigger a real download in production.`)
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center space-x-2 px-4 py-2 bg-tre1-teal text-white rounded-lg hover:bg-teal-600 transition"
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      <span>Download</span>
    </button>
  )
}