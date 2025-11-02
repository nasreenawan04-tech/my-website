
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import { EnhancedLoadingSpinner } from "@/components/ui/skeletons";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const NotFound = lazy(() => import("@/pages/not-found"));
const ToolPage = lazy(() => import("@/pages/tool-page"));
const AllTools = lazy(() => import("@/pages/all-tools"));
const FinanceTools = lazy(() => import("@/pages/finance-tools"));
const HealthTools = lazy(() => import("@/pages/health-tools"));
const TextTools = lazy(() => import("@/pages/text-tools"));
const AboutUs = lazy(() => import("@/pages/about-us"));
const ContactUs = lazy(() => import("@/pages/contact-us"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const Profile = lazy(() => import("@/pages/profile"));
const FavoriteTools = lazy(() => import("@/pages/favorite-tools"));
const RecentlyUsedTools = lazy(() => import("@/pages/recently-used-tools"));

const Router = () => {
  return (
    <Suspense fallback={<EnhancedLoadingSpinner />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tools" component={AllTools} />
        <Route path="/finance-tools" component={FinanceTools} />
        <Route path="/health-tools" component={HealthTools} />
        <Route path="/text-tools" component={TextTools} />
        <Route path="/tools/:slug" component={ToolPage} />
        <Route path="/about-us" component={AboutUs} />
        <Route path="/contact-us" component={ContactUs} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/help-center" component={HelpCenter} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/profile" component={Profile} />
        <Route path="/favorite-tools" component={FavoriteTools} />
        <Route path="/recently-used-tools" component={RecentlyUsedTools} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
};

export default Router;
