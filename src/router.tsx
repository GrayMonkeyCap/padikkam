import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { LessonsPage } from './features/lessons/LessonsPage';
import { LessonDetailPage } from './features/lessons/LessonDetailPage';
import { FlashcardsPage } from './features/flashcards/FlashcardsPage';
import { DialoguePage } from './features/dialogues/DialoguePage';
import { QuizPage } from './features/quizzes/QuizPage';
import { ProgressPage } from './features/progress/ProgressPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'learn', element: <LessonsPage /> },
      { path: 'learn/:lessonId', element: <LessonDetailPage /> },
      { path: 'review', element: <FlashcardsPage /> },
      { path: 'quiz/:lessonId', element: <QuizPage mode="lesson" /> },
      { path: 'practice', element: <QuizPage mode="all" /> },
      { path: 'practice/mistakes', element: <QuizPage mode="mistakes" /> },
      { path: 'dialogue/:dialogueId', element: <DialoguePage /> },
      { path: 'progress', element: <ProgressPage /> },
    ],
  },
]);
