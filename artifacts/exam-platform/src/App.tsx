import { useEffect, useRef, useState, type FormEvent } from "react";
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
const hasClerk = Boolean(clerkPubKey);

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function LocalAuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${isSignUp ? "register" : "login"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Authentication failed");
      }
      queryClient.clear();
      setLocation("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{isSignUp ? "Create your account" : "Sign in"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp ? "The first registered user becomes the central admin." : "Use your ExamPlatform account."}
          </p>
        </div>
        {isSignUp && (
          <label className="block text-sm font-medium">
            Name
            <input
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email
          <input
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <a className="text-primary underline" href={isSignUp ? "/sign-in" : "/sign-up"}>
            {isSignUp ? "Sign in" : "Create one"}
          </a>
        </p>
      </form>
    </div>
  );
}

function SignInPage() {
  if (!hasClerk) return <LocalAuthPage mode="sign-in" />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  if (!hasClerk) return <LocalAuthPage mode="sign-up" />;
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
  const { data: user, isLoading, isError } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !user) return <Redirect to="/" />;

  const role = user?.role;
  const isAdmin = role && ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(role);

  if (isAdmin) {
    return <Redirect to="/admin/dashboard" />;
  }
  return <Redirect to="/student/dashboard" />;
}

function HomeRedirect() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  if (!hasClerk) {
    if (isLoading) return <LoadingGate />;
    return user ? <RoleRouter /> : <Home />;
  }

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
  if (!hasClerk) return <AdminRoleGuard>{children}</AdminRoleGuard>;
  return (
    <>
      <Show when="signed-in"><AdminRoleGuard>{children}</AdminRoleGuard></Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function ProtectedStudent({ children }: { children: React.ReactNode }) {
  if (!hasClerk) return <StudentRoleGuard>{children}</StudentRoleGuard>;
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
  const { data: user, isLoading, isError } = useGetMe();
  if (isLoading) return <LoadingGate />;
  if (isError || !user) return <Redirect to="/sign-in" />;
  const isAdmin = user?.role && ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role);
  return isAdmin ? <>{children}</> : <Redirect to="/student/dashboard" />;
}

function StudentRoleGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe();
  if (isLoading) return <LoadingGate />;
  if (isError || !user) return <Redirect to="/sign-in" />;
  return user?.role === "STUDENT" ? <>{children}</> : <Redirect to="/admin/dashboard" />;
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {hasClerk && <ClerkQueryClientCacheInvalidator />}
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
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  if (!hasClerk) return <AppRoutes />;

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <AppRoutes />
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
