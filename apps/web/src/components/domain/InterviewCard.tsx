import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, Clock, CheckCircle, FileText } from 'lucide-react';
import type { InterviewQuestion, InterviewSession } from '@/store/interview';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface InterviewCardProps {
  question: InterviewQuestion;
  className?: string;
}

export function InterviewCard({ question, className }: InterviewCardProps) {
  const categoryColor = useMemo(() => {
    switch (question.category) {
      case 'technical':
        return 'blue';
      case 'behavioral':
        return 'clay';
      case 'situational':
        return 'moss';
      default:
        return 'default';
    }
  }, [question.category]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-5 ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mic className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-heading text-h4 text-text-primary">
                {question.question_text}
              </h3>
              <p className="text-body-sm text-text-secondary">
                {question.category}
              </p>
            </div>
          </div>
          <Badge variant={categoryColor}>
            {question.category}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-body-xs text-text-muted">
            <Clock className="w-3 h-3" />
            <span>Tempo estimado: {question.estimated_time || '2-3 min'}</span>
          </div>
          {question.example_answer && (
            <div className="flex items-start gap-2 text-body-xs text-text-secondary">
              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="italic">" {question.example_answer} "</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-sage-500" />
            <span className="text-body-xs text-text-muted">
              {question.difficulty}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
