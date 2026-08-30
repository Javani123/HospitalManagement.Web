import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderTree,
  TestTube,
  Scale,
  Microscope,
  SlidersHorizontal,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';

export const QuickLinks: React.FC = () => {
  const links = [
    {
      title: 'Patient Master',
      description: 'Manage patient registrations and records (M8)',
      to: '/patients',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      tag: 'Completed M8',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Pathology Categories',
      description: 'Configure diagnostic laboratory test categories (M3)',
      to: '/pathology/test-categories',
      icon: <FolderTree className="w-5 h-5 text-purple-600" />,
      tag: 'Completed M3',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Sample Types',
      description: 'Define collection specimen types & protocols (M4)',
      to: '/pathology/sample-types',
      icon: <TestTube className="w-5 h-5 text-amber-600" />,
      tag: 'Completed M4',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Measurement Units',
      description: 'Configure diagnostic measurement units (M5)',
      to: '/pathology/units',
      icon: <Scale className="w-5 h-5 text-indigo-600" />,
      tag: 'Completed M5',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Pathology Tests',
      description: 'Maintain lab tests directory and pricing (M6)',
      to: '/pathology/tests',
      icon: <Microscope className="w-5 h-5 text-cyan-600" />,
      tag: 'Completed M6',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Reference Ranges',
      description: 'Configure gender and age-specific normal ranges (M7)',
      to: '/pathology/reference-ranges',
      icon: <SlidersHorizontal className="w-5 h-5 text-rose-600" />,
      tag: 'Completed M7',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Lab Orders',
      description: 'Clinical test requests, samples, and results (M9)',
      to: '/pathology/lab-orders',
      icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
      tag: 'In Development M9',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => (
        <Link
          key={link.title}
          to={link.to}
          className="group bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                {link.icon}
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${link.tagColor}`}>
                {link.tag}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {link.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{link.description}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
            <span>View module</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      ))}
    </div>
  );
};
