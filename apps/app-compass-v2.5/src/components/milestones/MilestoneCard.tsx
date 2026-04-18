/**
 * MilestoneCard Component
 * Display milestone with tasks and progress
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milestone } from '@/stores/routeBuilderStore';

interface MilestoneCardProps {
  milestone: Milestone;
  onComplete?: () => void;
  onTaskComplete?: (taskId: string) => void;
  isExpanded?: boolean;
  className?: string;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onComplete,
  onTaskComplete,
  isExpanded: initialExpanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const completedTasks = milestone.tasks.filter((t) => t.is_completed).length;
  const totalTasks = milestone.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const allTasksComplete = completedTasks === totalTasks && totalTasks > 0;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCompleteMilestone = () => {
    if (onComplete && allTasksComplete && !milestone.is_completed) {
      onComplete();
    }
  };

  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden
        ${milestone.is_completed ? 'opacity-75' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={handleToggleExpand}
      >
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {milestone.is_completed ? (
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {milestone.order_index + 1}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {milestone.title}
              </h3>
              <button
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand();
                }}
              >
                <svg
                  className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {milestone.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span className="font-semibold">
                  {completedTasks}/{totalTasks} tasks
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {milestone.estimated_duration_days} days
              </span>
              {milestone.completed_at && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed {new Date(milestone.completed_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content - Tasks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tasks
              </h4>
              
              <div className="space-y-2">
                {milestone.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${task.is_completed
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }
                    `}
                    whileHover={{ scale: task.is_completed ? 1 : 1.01 }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => !task.is_completed && onTaskComplete?.(task.id)}
                        disabled={task.is_completed}
                        className={`
                          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                          ${task.is_completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                          }
                        `}
                      >
                        {task.is_completed && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <h5 className={`
                          text-sm font-medium mb-1
                          ${task.is_completed
                            ? 'text-gray-500 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-white'
                          }
                        `}>
                          {task.title}
                        </h5>
                        <p className={`
                          text-xs
                          ${task.is_completed
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-600 dark:text-gray-400'
                          }
                        `}>
                          {task.description}
                        </p>
                        {task.completed_at && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Completed {new Date(task.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Complete Milestone Button */}
              {allTasksComplete && !milestone.is_completed && onComplete && (
                <motion.button
                  onClick={handleCompleteMilestone}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎉 Complete Milestone
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MilestoneCard;
