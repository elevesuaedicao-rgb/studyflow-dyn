import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Send } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  type: 'mcq' | 'numeric';
  question: string;
  options?: any;
  answer: any;
  tolerance?: number;
}

interface ExerciseComponentProps {
  exercise: Exercise;
  onAttemptSubmitted?: () => void;
}

export function ExerciseComponent({ exercise, onAttemptSubmitted }: ExerciseComponentProps) {
  const { user } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [numericAnswer, setNumericAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit answers.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const answer = exercise.type === 'mcq' ? selectedAnswer : parseFloat(numericAnswer);
    let correct = false;

    if (exercise.type === 'mcq') {
      correct = selectedAnswer === exercise.answer;
    } else if (exercise.type === 'numeric') {
      const expectedAnswer = parseFloat(exercise.answer);
      const tolerance = exercise.tolerance || 1e-3;
      const userAnswer = parseFloat(numericAnswer);
      correct = Math.abs(userAnswer - expectedAnswer) <= tolerance;
    }

    try {
      const { error } = await supabase
        .from('attempts')
        .insert({
          user_id: user.id,
          exercise_id: exercise.id,
          submitted_answer: { value: answer },
          is_correct: correct
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit answer. Please try again.",
          variant: "destructive"
        });
        console.error('Error submitting attempt:', error);
      } else {
        setIsSubmitted(true);
        setIsCorrect(correct);
        onAttemptSubmitted?.();
        
        toast({
          title: correct ? "Correct!" : "Incorrect",
          description: correct 
            ? "Great job! Your answer is correct." 
            : "That's not quite right. Try again!",
          variant: correct ? "default" : "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting attempt:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = exercise.type === 'mcq' ? selectedAnswer : numericAnswer.trim();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Exercise</CardTitle>
          <Badge variant={exercise.type === 'mcq' ? 'default' : 'secondary'}>
            {exercise.type === 'mcq' ? 'Multiple Choice' : 'Numeric'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <MarkdownRenderer content={exercise.question} />
        </div>

        {exercise.type === 'mcq' && exercise.options && (
          <RadioGroup 
            value={selectedAnswer} 
            onValueChange={setSelectedAnswer}
            disabled={isSubmitted}
          >
            {exercise.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  <MarkdownRenderer content={option} className="prose-sm" />
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {exercise.type === 'numeric' && (
          <div className="space-y-2">
            <Label htmlFor="numeric-answer">Your Answer</Label>
            <Input
              id="numeric-answer"
              type="number"
              step="any"
              value={numericAnswer}
              onChange={(e) => setNumericAnswer(e.target.value)}
              placeholder="Enter your numeric answer"
              disabled={isSubmitted}
            />
            {exercise.tolerance && (
              <p className="text-sm text-muted-foreground">
                Tolerance: ±{exercise.tolerance}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            {isSubmitted && (
              <>
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </>
            )}
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitted || isSubmitting}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Send className="mr-2 h-4 w-4 animate-pulse" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}