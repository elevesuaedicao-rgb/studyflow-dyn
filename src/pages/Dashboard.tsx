import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LogOut, 
  GraduationCap, 
  BookOpen, 
  Calculator,
  CheckCircle,
  Circle,
  User,
  Settings
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ExerciseComponent } from '@/components/ExerciseComponent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  subtitle: string;
}

interface Lesson {
  id: string;
  title: string;
  number: number;
  course_id: string;
}

interface LessonItem {
  id: string;
  title: string;
  type: 'theory' | 'example' | 'exercise';
  content_markdown: string;
  order_index: number;
  lesson_id: string;
}

interface Exercise {
  id: string;
  lesson_item_id: string;
  type: 'mcq' | 'numeric';
  question: string;
  options?: any;
  answer: any;
  tolerance?: number;
}

interface UserProgress {
  completed_items: string[];
}

export default function Dashboard() {
  const { user, userProfile, signOut, loading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonItems, setLessonItems] = useState<LessonItem[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({ completed_items: [] });
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCourseData();
      loadUserProgress();
    }
  }, [user]);

  const loadCourseData = async () => {
    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .limit(1)
        .single();

      if (courseError) {
        console.error('Error loading course:', courseError);
        return;
      }

      setCourse(courseData);

      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseData.id)
        .order('number');

      if (lessonsError) {
        console.error('Error loading lessons:', lessonsError);
        return;
      }

      setLessons(lessonsData);

      // Load lesson items
      const lessonIds = lessonsData.map(lesson => lesson.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('lesson_items')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('order_index');

      if (itemsError) {
        console.error('Error loading lesson items:', itemsError);
        return;
      }

      setLessonItems(itemsData);

      // Load exercises
      const exerciseItemIds = itemsData
        .filter(item => item.type === 'exercise')
        .map(item => item.id);

      if (exerciseItemIds.length > 0) {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .in('lesson_item_id', exerciseItemIds);

        if (exercisesError) {
          console.error('Error loading exercises:', exercisesError);
        } else {
          setExercises(exercisesData);
        }
      }

      // Set the first lesson as active tab if it exists
      if (lessonsData.length > 0) {
        setActiveTab(`lesson-${lessonsData[0].number}`);
      }

    } catch (error) {
      console.error('Error loading course data:', error);
      toast({
        title: "Error",
        description: "Failed to load course data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user || !course) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('completed_items')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading user progress:', error);
        return;
      }

      if (data && data.completed_items) {
        // Ensure completed_items is properly typed as string array
        const completedItems = Array.isArray(data.completed_items) 
          ? data.completed_items as string[]
          : [];
        setUserProgress({ completed_items: completedItems });
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const toggleItemCompletion = async (itemId: string) => {
    if (!user || !course) return;

    const isCompleted = userProgress.completed_items.includes(itemId);
    const newCompletedItems = isCompleted
      ? userProgress.completed_items.filter(id => id !== itemId)
      : [...userProgress.completed_items, itemId];

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: course.id,
          completed_items: newCompletedItems
        });

      if (error) {
        console.error('Error updating progress:', error);
        toast({
          title: "Error",
          description: "Failed to update progress. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setUserProgress({ completed_items: newCompletedItems });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Handle loading states first
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading course data...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getProgressPercentage = () => {
    if (lessonItems.length === 0) return 0;
    return Math.round((userProgress.completed_items.length / lessonItems.length) * 100);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return <BookOpen className="h-4 w-4" />;
      case 'example':
        return <Calculator className="h-4 w-4" />;
      case 'exercise':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const renderLessonContent = (lesson: Lesson) => {
    const items = lessonItems.filter(item => item.lesson_id === lesson.id);
    
    return (
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-6 pr-4">
          {items.map((item) => {
            const exercise = exercises.find(ex => ex.lesson_item_id === item.id);
            
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getItemIcon(item.type)}
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <Badge variant={
                      item.type === 'theory' ? 'default' : 
                      item.type === 'example' ? 'secondary' : 
                      'outline'
                    }>
                      {item.type === 'theory' ? 'Theory' : 
                       item.type === 'example' ? 'Example' : 'Exercise'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.type === 'exercise' && exercise ? (
                    <ExerciseComponent 
                      exercise={exercise}
                      onAttemptSubmitted={() => {
                        // Optionally mark as completed when exercise is attempted
                        if (!userProgress.completed_items.includes(item.id)) {
                          toggleItemCompletion(item.id);
                        }
                      }}
                    />
                  ) : (
                    <MarkdownRenderer content={item.content_markdown || ''} />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Course Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No course content has been created yet. Please contact your instructor.
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">{course.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{userProfile?.name}</p>
                <Badge variant="outline" className="text-xs">
                  {userProfile?.role}
                </Badge>
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm text-muted-foreground">
                  {userProgress.completed_items.length} of {lessonItems.length} completed
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {getProgressPercentage()}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <ScrollArea>
              <TabsList className="inline-flex space-x-2 bg-transparent p-0">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Course Overview
                </TabsTrigger>
                {lessons.map((lesson) => (
                  <TabsTrigger 
                    key={lesson.id} 
                    value={`lesson-${lesson.number}`}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Aula {lesson.number}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Course Syllabus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson) => {
                    const items = lessonItems.filter(item => item.lesson_id === lesson.id);
                    
                    return (
                      <div key={lesson.id} className="space-y-2">
                        <h3 className="font-semibold text-lg">{lesson.title}</h3>
                        <div className="space-y-2 ml-4">
                          {items.map((item) => {
                            const isCompleted = userProgress.completed_items.includes(item.id);
                            
                            return (
                              <div key={item.id} className="flex items-center space-x-3">
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => toggleItemCompletion(item.id)}
                                />
                                <div className="flex items-center space-x-2 flex-1">
                                  {getItemIcon(item.type)}
                                  <span className={`${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.title}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    {item.type}
                                  </Badge>
                                </div>
                                {isCompleted && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {lesson.number < lessons.length && <Separator className="my-4" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {lessons.map((lesson) => (
            <TabsContent key={lesson.id} value={`lesson-${lesson.number}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{lesson.title}</h2>
                  <Badge variant="secondary">
                    Lesson {lesson.number}
                  </Badge>
                </div>
                {renderLessonContent(lesson)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}