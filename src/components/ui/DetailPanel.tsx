'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { projects, categories } from '@/data/projects';
import { CATEGORY_COLORS, COLORS } from '@/lib/constants';

interface Props {
  nodeId: string | null;
  onClose: () => void;
}

export default function DetailPanel({ nodeId, onClose }: Props) {
  const project = projects.find((p) => p.id === nodeId);
  const category = categories.find((c) => c.id === nodeId);

  const node = project || category;
  const isProject = !!project;

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 pointer-events-auto"
          style={{
            background: `linear-gradient(135deg, rgba(10,10,15,0.95) 0%, rgba(20,20,30,0.98) 100%)`,
            borderLeft: `1px solid ${isProject ? CATEGORY_COLORS[project.category] : COLORS.white}20`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="h-full overflow-y-auto p-8 flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: isProject
                    ? CATEGORY_COLORS[project.category]
                    : COLORS.white,
                  boxShadow: `0 0 20px ${
                    isProject ? CATEGORY_COLORS[project.category] : COLORS.white
                  }80`,
                }}
              />
              <button
                onClick={onClose}
                className="text-sm opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: COLORS.white }}
              >
                ESC
              </button>
            </div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold mb-3"
              style={{
                color: isProject
                  ? CATEGORY_COLORS[project.category]
                  : COLORS.white,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              {node.label}
            </motion.h2>

            {isProject && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-sm mb-6 leading-relaxed"
                style={{ color: COLORS.white, opacity: 0.6 }}
              >
                {project.description}
              </motion.p>
            )}

            {isProject && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2 mb-8"
              >
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${CATEGORY_COLORS[project.category]}15`,
                      color: CATEGORY_COLORS[project.category],
                      border: `1px solid ${CATEGORY_COLORS[project.category]}30`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}

            {isProject && project.links && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex gap-3 mt-auto"
              >
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: `${CATEGORY_COLORS[project.category]}20`,
                      color: CATEGORY_COLORS[project.category],
                      border: `1px solid ${CATEGORY_COLORS[project.category]}40`,
                    }}
                  >
                    GitHub
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: CATEGORY_COLORS[project.category],
                      color: COLORS.bg,
                    }}
                  >
                    Live Demo
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
