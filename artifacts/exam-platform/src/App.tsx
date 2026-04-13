import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminStates from "@/pages/admin/states";
import AdminDistricts from "@/pages/admin/districts";
import AdminInstitutions from "@/pages/admin/institutions";
import AdminUsers from "@/pages/admin/users";
import AdminClasses from "@/pages/admin/classes";
import AdminChapters from "@/pages/admin/chapters";
import AdminContent from "@/pages/admin/content";
import AdminQuizzes from "@/pages/admin/quizzes";
import AdminQuizDetail from "@/pages/admin/quiz-detail";
import StudentDashboard from "@/pages/student/dashboard";
import StudentChapters from "@/pages/student/chapters";
import StudentChapterView from "@/pages/student/chapter-view";
import StudentQuizAttempt from "@/pages/student/quiz-attempt";
import StudentResults from "@/pages/student/results";
import About from "@/pages/about";
import ClassesPublic from "@/pages/classes";
import DemoContent from "@/pages/demo-content";
import { useGetMe } from "@workspace/api-client-react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function RoleRouter() {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = user?.role;
  const isAdmin = role && ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(role);

  if (isAdmin) {
    return <Redirect to="/admin/dashboard" />;
  }
  return <Redirect to="/student/dashboard" />;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <RoleRouter />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in"><AdminRoleGuard>{children}</AdminRoleGuard></Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function ProtectedStudent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in"><StudentRoleGuard>{children}</StudentRoleGuard></Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function LoadingGate() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe();
  if (isLoading) return <LoadingGate />;
  const isAdmin = user?.role && ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role);
  return isAdmin ? <>{children}</> : <Redirect to="/student/dashboard" />;
}

function StudentRoleGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe();
  if (isLoading) return <LoadingGate />;
  return user?.role === "STUDENT" ? <>{children}</> : <Redirect to="/admin/dashboard" />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/about" component={About} />
            <Route path="/classes" component={ClassesPublic} />
            <Route path="/demo-content" component={DemoContent} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/admin/dashboard">{() => <ProtectedAdmin><AdminDashboard /></ProtectedAdmin>}</Route>
            <Route path="/admin/states">{() => <ProtectedAdmin><AdminStates /></ProtectedAdmin>}</Route>
            <Route path="/admin/districts">{() => <ProtectedAdmin><AdminDistricts /></ProtectedAdmin>}</Route>
            <Route path="/admin/institutions">{() => <ProtectedAdmin><AdminInstitutions /></ProtectedAdmin>}</Route>
            <Route path="/admin/users">{() => <ProtectedAdmin><AdminUsers /></ProtectedAdmin>}</Route>
            <Route path="/admin/classes">{() => <ProtectedAdmin><AdminClasses /></ProtectedAdmin>}</Route>
            <Route path="/admin/chapters">{() => <ProtectedAdmin><AdminChapters /></ProtectedAdmin>}</Route>
            <Route path="/admin/content/:chapterId">{(params) => <ProtectedAdmin><AdminContent chapterId={Number(params.chapterId)} /></ProtectedAdmin>}</Route>
            <Route path="/admin/quizzes">{() => <ProtectedAdmin><AdminQuizzes /></ProtectedAdmin>}</Route>
            <Route path="/admin/quiz/:id">{(params) => <ProtectedAdmin><AdminQuizDetail quizId={Number(params.id)} /></ProtectedAdmin>}</Route>
            <Route path="/student/dashboard">{() => <ProtectedStudent><StudentDashboard /></ProtectedStudent>}</Route>
            <Route path="/student/chapters">{() => <ProtectedStudent><StudentChapters /></ProtectedStudent>}</Route>
            <Route path="/student/chapter/:id">{(params) => <ProtectedStudent><StudentChapterView chapterId={Number(params.id)} /></ProtectedStudent>}</Route>
            <Route path="/student/quiz/:id">{(params) => <ProtectedStudent><StudentQuizAttempt quizId={Number(params.id)} /></ProtectedStudent>}</Route>
            <Route path="/student/results">{() => <ProtectedStudent><StudentResults /></ProtectedStudent>}</Route>
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
