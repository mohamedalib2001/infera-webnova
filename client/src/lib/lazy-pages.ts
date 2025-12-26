/**
 * Lazy Page Imports - Governance Compliant
 * All pages are loaded via React.lazy() per routing policy
 */
import { lazy } from "react";

// Core Pages - Guest
export const Landing = lazy(() => import("@/pages/landing"));
export const Auth = lazy(() => import("@/pages/auth"));
export const Pricing = lazy(() => import("@/pages/pricing"));
export const Preview = lazy(() => import("@/pages/preview"));
export const NotFound = lazy(() => import("@/pages/not-found"));

// Core Pages - Authenticated
export const Home = lazy(() => import("@/pages/home"));
export const Settings = lazy(() => import("@/pages/settings"));
export const Support = lazy(() => import("@/pages/support"));
export const Sovereign = lazy(() => import("@/pages/sovereign"));
export const SovereignWorkspace = lazy(() => import("@/pages/sovereign-workspace"));

// Nova AI
export const NovaAIDashboard = lazy(() => import("@/pages/nova-ai-dashboard"));
export const NovaChat = lazy(() => import("@/pages/nova-chat"));

// Business
export const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
export const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));
export const Subscription = lazy(() => import("@/pages/subscription"));

// Legal Pages
export const About = lazy(() => import("@/pages/about"));
export const Contact = lazy(() => import("@/pages/contact"));
export const Terms = lazy(() => import("@/pages/terms"));
export const Privacy = lazy(() => import("@/pages/privacy"));
export const Refund = lazy(() => import("@/pages/refund"));

// Platform Landing Pages
export const InferaLanding = lazy(() => import("@/pages/infera-landing"));
export const EngineControlLanding = lazy(() => import("@/pages/engine-control-landing"));
export const EngineLanding = lazy(() => import("@/pages/engine-landing"));
export const FinanceLanding = lazy(() => import("@/pages/finance-landing"));
export const HumanIQLanding = lazy(() => import("@/pages/humaniq-landing"));
export const LegalLanding = lazy(() => import("@/pages/legal-landing"));
export const AppForgeLanding = lazy(() => import("@/pages/appforge-landing"));
export const MarketingLanding = lazy(() => import("@/pages/marketing-landing"));
export const MarketplaceLanding = lazy(() => import("@/pages/marketplace-landing"));
export const EducationLanding = lazy(() => import("@/pages/education-landing"));
export const AttendLanding = lazy(() => import("@/pages/attend-landing"));
export const SmartDocsLanding = lazy(() => import("@/pages/smartdocs-landing"));
export const HospitalityLanding = lazy(() => import("@/pages/hospitality-landing"));
export const FeasibilityLanding = lazy(() => import("@/pages/feasibility-landing"));
export const CVBuilderLanding = lazy(() => import("@/pages/cvbuilder-landing"));
export const JobsLanding = lazy(() => import("@/pages/jobs-landing"));
export const TrainAILanding = lazy(() => import("@/pages/trainai-landing"));
export const GlobalCloudLanding = lazy(() => import("@/pages/globalcloud-landing"));
export const ShieldGridLanding = lazy(() => import("@/pages/shieldgrid-landing"));
export const SmartRemoteLanding = lazy(() => import("@/pages/smartremote-landing"));
