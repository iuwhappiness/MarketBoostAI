import React from 'react';
import type { SavedProject } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ProjectsPanelProps {
  projects: SavedProject[];
  currentProjectId: string | null;
  onNew: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ projects, currentProjectId, onNew, onLoad, onDelete }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-200">Proyek Anda</h3>
        <button
          onClick={onNew}
          className="flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold py-1.5 px-3 rounded-md hover:bg-purple-700 transition"
          title="Buat proyek baru"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Proyek Baru</span>
        </button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Belum ada proyek. Yuk mulai bikin yang pertama!</p>
        ) : (
          [...projects].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(project => (
            <div
              key={project.id}
              className={`flex items-center justify-between p-2 rounded-md transition ${currentProjectId === project.id ? 'bg-indigo-800/50' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
            >
              <div className="flex-1 truncate">
                <p className="font-semibold text-sm text-gray-200 truncate">{project.name}</p>
                <p className="text-xs text-gray-500">{new Date(project.timestamp).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => onLoad(project.id)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md"
                  title="Muat Proyek"
                >
                  <FolderOpenIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded-md"
                  title="Hapus Proyek"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};