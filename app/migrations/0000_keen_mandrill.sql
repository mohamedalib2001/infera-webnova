CREATE TABLE "active_contributors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contributor_id" varchar NOT NULL,
	"contributor_type" text DEFAULT 'user' NOT NULL,
	"contributor_name" text NOT NULL,
	"contributor_avatar" text,
	"contributor_role" text,
	"context_id" varchar,
	"current_task" text,
	"current_file" text,
	"status" text DEFAULT 'active' NOT NULL,
	"status_reason" text,
	"changes_applied" integer DEFAULT 0 NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"pending_actions" integer DEFAULT 0 NOT NULL,
	"failed_actions" integer DEFAULT 0 NOT NULL,
	"average_response_time_ms" integer DEFAULT 0 NOT NULL,
	"project_impact_score" real DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"last_active_at" timestamp DEFAULT now(),
	"session_duration_minutes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"parent_role_id" varchar,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_roles_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "agent_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"title" text,
	"user_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"token_count" integer DEFAULT 0 NOT NULL,
	"context" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_conversations_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "agent_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aggregate_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_id" varchar NOT NULL,
	"aggregate_type" text NOT NULL,
	"tenant_id" varchar,
	"version" integer NOT NULL,
	"state" jsonb NOT NULL,
	"last_event_sequence" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_assistant_capabilities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assistant_id" varchar NOT NULL,
	"assistant_type" text NOT NULL,
	"capability_code" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"modified_by" varchar NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_assistants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"avatar" text,
	"specialty" text NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"system_prompt" text NOT NULL,
	"model" text DEFAULT 'claude-sonnet-4-20250514' NOT NULL,
	"temperature" integer DEFAULT 70 NOT NULL,
	"max_tokens" integer DEFAULT 4000 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"total_tasks_completed" integer DEFAULT 0 NOT NULL,
	"success_rate" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_billing_insights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar,
	"insight_type" text NOT NULL,
	"severity" text DEFAULT 'info' NOT NULL,
	"churn_probability" integer,
	"upgrade_recommendation" text,
	"fraud_score" integer,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text,
	"description_ar" text,
	"recommended_action" text,
	"recommended_action_ar" text,
	"status" text DEFAULT 'active' NOT NULL,
	"acknowledged_at" timestamp,
	"acknowledged_by" varchar,
	"analysis_factors" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_build_artifacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"task_id" varchar,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"content_hash" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_build_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"prompt" text NOT NULL,
	"prompt_ar" text,
	"app_type" text,
	"app_name" text DEFAULT 'New Application' NOT NULL,
	"app_name_ar" text,
	"plan" jsonb,
	"status" text DEFAULT 'planning' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"total_steps" integer DEFAULT 0 NOT NULL,
	"project_id" varchar,
	"generated_schema" text,
	"generated_backend" text,
	"generated_frontend" text,
	"generated_styles" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_build_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"step_number" integer NOT NULL,
	"task_type" text NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text,
	"description_ar" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"input" jsonb DEFAULT '{}'::jsonb,
	"output" text,
	"output_type" text,
	"ai_prompt" text,
	"ai_response" text,
	"tokens_used" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_collaborators" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"role" text NOT NULL,
	"avatar" text,
	"description" text,
	"description_ar" text,
	"capabilities" jsonb DEFAULT '[]'::jsonb,
	"model_id" text DEFAULT 'claude-sonnet-4-20250514' NOT NULL,
	"can_execute_code" boolean DEFAULT false NOT NULL,
	"can_modify_files" boolean DEFAULT false NOT NULL,
	"can_create_tasks" boolean DEFAULT true NOT NULL,
	"can_approve_changes" boolean DEFAULT false NOT NULL,
	"max_autonomy_level" integer DEFAULT 50 NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"changes_applied" integer DEFAULT 0 NOT NULL,
	"bugs_fixed" integer DEFAULT 0 NOT NULL,
	"decisions_executed" integer DEFAULT 0 NOT NULL,
	"time_saved_minutes" integer DEFAULT 0 NOT NULL,
	"average_response_time_ms" integer DEFAULT 0 NOT NULL,
	"success_rate" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_active_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_constitution" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"rules" jsonb NOT NULL,
	"enforcement_level" text DEFAULT 'strict' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_modified_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_cost_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"model_id" varchar NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"input_cost" integer DEFAULT 0 NOT NULL,
	"output_cost" integer DEFAULT 0 NOT NULL,
	"total_cost" integer DEFAULT 0 NOT NULL,
	"feature" text DEFAULT 'chat' NOT NULL,
	"project_id" varchar,
	"session_id" varchar,
	"date" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_decision_memory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"conversation_id" varchar,
	"decision_type" text NOT NULL,
	"question" text NOT NULL,
	"question_ar" text,
	"chosen_option" text NOT NULL,
	"chosen_option_ar" text,
	"reasoning" text NOT NULL,
	"reasoning_ar" text,
	"alternatives_considered" jsonb DEFAULT '[]'::jsonb,
	"context_at_decision" jsonb,
	"impact_level" text DEFAULT 'medium' NOT NULL,
	"affected_areas" jsonb DEFAULT '[]'::jsonb,
	"was_reversed" boolean DEFAULT false NOT NULL,
	"reversed_at" timestamp,
	"reversed_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_forecast_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_name" text NOT NULL,
	"run_name_ar" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"parameters" jsonb NOT NULL,
	"platform_metrics" jsonb,
	"ai_analysis" text,
	"ai_analysis_ar" text,
	"predictions" jsonb,
	"identified_risks" jsonb,
	"growth_forecast" real,
	"risk_level" text,
	"confidence_score" real,
	"created_by" varchar,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_global_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emergency_kill_switch" boolean DEFAULT false NOT NULL,
	"kill_switch_reason" text,
	"kill_switch_activated_at" timestamp,
	"kill_switch_activated_by" varchar,
	"global_default_model_id" text,
	"global_max_input_tokens" integer DEFAULT 100000,
	"global_max_output_tokens" integer DEFAULT 8192,
	"global_rate_limit_per_minute" integer DEFAULT 60,
	"global_rate_limit_per_hour" integer DEFAULT 1000,
	"global_rate_limit_per_day" integer DEFAULT 10000,
	"daily_cost_limit_usd" real DEFAULT 100,
	"monthly_cost_limit_usd" real DEFAULT 2000,
	"cost_alert_threshold" real DEFAULT 0.8,
	"enable_auto_fallback" boolean DEFAULT true NOT NULL,
	"max_fallback_attempts" integer DEFAULT 3,
	"enable_detailed_logging" boolean DEFAULT true NOT NULL,
	"log_retention_days" integer DEFAULT 90,
	"health_check_interval_minutes" integer DEFAULT 5,
	"unhealthy_after_failures" integer DEFAULT 3,
	"updated_by" varchar,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_kill_switch" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"target_id" varchar,
	"is_active" boolean DEFAULT false NOT NULL,
	"reason" text,
	"reason_ar" text,
	"activated_by" varchar NOT NULL,
	"activated_at" timestamp DEFAULT now(),
	"deactivated_at" timestamp,
	"deactivated_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_kill_switch_state" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"target_layer_id" varchar,
	"is_activated" boolean DEFAULT false NOT NULL,
	"activated_by" varchar,
	"activated_at" timestamp,
	"reason" text,
	"reason_ar" text,
	"auto_reactivate_at" timestamp,
	"can_subscriber_deactivate" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_layers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"purpose" text NOT NULL,
	"purpose_ar" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"allowed_for_subscribers" boolean DEFAULT false NOT NULL,
	"subscriber_visibility" text DEFAULT 'hidden' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_model_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar,
	"action" text NOT NULL,
	"action_category" text NOT NULL,
	"actor_id" varchar,
	"actor_role" text,
	"actor_ip" text,
	"actor_user_agent" text,
	"previous_state" jsonb,
	"new_state" jsonb,
	"changed_fields" jsonb DEFAULT '[]'::jsonb,
	"reason" text,
	"context" jsonb DEFAULT '{}'::jsonb,
	"success" boolean DEFAULT true,
	"error_message" text,
	"hash" text,
	"previous_hash" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_model_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" text NOT NULL,
	"provider" text NOT NULL,
	"display_name" text NOT NULL,
	"display_name_ar" text,
	"input_price_per_1m" real DEFAULT 0 NOT NULL,
	"output_price_per_1m" real DEFAULT 0 NOT NULL,
	"markup_percentage" real DEFAULT 50 NOT NULL,
	"max_tokens" integer DEFAULT 4096 NOT NULL,
	"supports_vision" boolean DEFAULT false NOT NULL,
	"supports_tools" boolean DEFAULT false NOT NULL,
	"recommended_for" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_model_configs_model_id_unique" UNIQUE("model_id")
);
--> statement-breakpoint
CREATE TABLE "ai_model_intake_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar,
	"job_type" text NOT NULL,
	"intake_method" text NOT NULL,
	"source_url" text,
	"source_registry" text,
	"source_model_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0,
	"current_step" text,
	"total_steps" integer DEFAULT 1,
	"current_step_number" integer DEFAULT 0,
	"downloaded_bytes" integer DEFAULT 0,
	"total_bytes" integer,
	"download_speed" integer,
	"validation_passed" boolean,
	"validation_errors" jsonb DEFAULT '[]'::jsonb,
	"checksum_verified" boolean,
	"error_message" text,
	"error_code" text,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"started_at" timestamp,
	"completed_at" timestamp,
	"estimated_time_remaining" integer,
	"initiated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_model_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"requests_per_minute" integer DEFAULT 60,
	"requests_per_hour" integer DEFAULT 1000,
	"requests_per_day" integer DEFAULT 10000,
	"tokens_per_minute" integer DEFAULT 100000,
	"tokens_per_day" integer DEFAULT 1000000,
	"daily_cost_limit_cents" integer,
	"monthly_cost_limit_cents" integer,
	"allowed_plans" jsonb DEFAULT '[]'::jsonb,
	"allowed_users" jsonb DEFAULT '[]'::jsonb,
	"blocked_users" jsonb DEFAULT '[]'::jsonb,
	"allow_streaming" boolean DEFAULT true,
	"allow_function_calling" boolean DEFAULT true,
	"allow_system_prompt" boolean DEFAULT true,
	"max_input_tokens" integer,
	"max_output_tokens" integer,
	"max_context_length" integer,
	"enable_content_filter" boolean DEFAULT true,
	"blocked_topics" jsonb DEFAULT '[]'::jsonb,
	"priority" integer DEFAULT 0,
	"routing_weight" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_model_registry" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"slug" text NOT NULL,
	"description" text,
	"description_ar" text,
	"provider" text NOT NULL,
	"source_url" text,
	"registry_source" text,
	"model_type" text DEFAULT 'chat' NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb,
	"supported_languages" jsonb DEFAULT '["en"]'::jsonb,
	"intake_method" text DEFAULT 'external_api' NOT NULL,
	"model_format" text,
	"storage_path" text,
	"storage_size" integer,
	"checksum" text,
	"parameter_count" text,
	"context_window" integer DEFAULT 4096,
	"max_output_tokens" integer DEFAULT 4096,
	"quantization" text,
	"min_vram" integer,
	"recommended_vram" integer,
	"min_ram" integer,
	"cpu_only" boolean DEFAULT false,
	"hardware_requirements" jsonb DEFAULT '{}'::jsonb,
	"license" text,
	"license_url" text,
	"commercial_use" boolean DEFAULT true,
	"input_cost_per_1m" integer DEFAULT 0,
	"output_cost_per_1m" integer DEFAULT 0,
	"api_endpoint" text,
	"api_key_secret_ref" text,
	"api_headers" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"status_message" text,
	"is_default" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"allowed_plans" jsonb DEFAULT '["owner","sovereign"]'::jsonb,
	"allowed_users" jsonb DEFAULT '[]'::jsonb,
	"total_requests" integer DEFAULT 0,
	"total_tokens_processed" integer DEFAULT 0,
	"average_latency" integer DEFAULT 0,
	"last_used_at" timestamp,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_model_registry_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_model_runtimes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar NOT NULL,
	"engine" text DEFAULT 'external_api' NOT NULL,
	"engine_version" text,
	"container_image" text,
	"container_tag" text,
	"container_port" integer DEFAULT 8080,
	"container_env" jsonb DEFAULT '{}'::jsonb,
	"cpu_cores" integer DEFAULT 4,
	"memory_mb" integer DEFAULT 16384,
	"gpu_type" text,
	"gpu_count" integer DEFAULT 0,
	"gpu_memory_mb" integer,
	"min_replicas" integer DEFAULT 0,
	"max_replicas" integer DEFAULT 1,
	"scale_to_zero" boolean DEFAULT true,
	"idle_timeout_seconds" integer DEFAULT 300,
	"max_concurrent_requests" integer DEFAULT 10,
	"request_timeout_seconds" integer DEFAULT 120,
	"max_batch_size" integer DEFAULT 1,
	"deployment_type" text DEFAULT 'kubernetes',
	"node_selector" jsonb DEFAULT '{}'::jsonb,
	"tolerations" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT false,
	"last_health_check" timestamp,
	"health_status" text DEFAULT 'unknown',
	"current_replicas" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"model_id" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"max_tokens" integer DEFAULT 4096 NOT NULL,
	"context_window" integer DEFAULT 128000 NOT NULL,
	"input_cost_per_1m" integer DEFAULT 0 NOT NULL,
	"output_cost_per_1m" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"allowed_plans" jsonb DEFAULT '["pro","enterprise","sovereign","owner"]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_models_model_id_unique" UNIQUE("model_id")
);
--> statement-breakpoint
CREATE TABLE "ai_orchestration_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"match_task_types" jsonb DEFAULT '[]'::jsonb,
	"match_sensitivity" text,
	"match_cost_tier" text,
	"match_conditions" jsonb DEFAULT '[]'::jsonb,
	"primary_model_id" varchar,
	"fallback_model_ids" jsonb DEFAULT '[]'::jsonb,
	"routing_strategy" text DEFAULT 'priority',
	"load_balance_weights" jsonb DEFAULT '{}'::jsonb,
	"max_latency_ms" integer,
	"min_throughput" integer,
	"max_cost_per_request" integer,
	"prefer_cheaper" boolean DEFAULT false,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"policy_type" text NOT NULL,
	"scope" text NOT NULL,
	"scope_value" text,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"priority" integer DEFAULT 50 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_human_review" boolean DEFAULT false NOT NULL,
	"reviewer_roles" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_power_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"layer_id" varchar NOT NULL,
	"power_level" integer DEFAULT 5 NOT NULL,
	"max_tokens_per_request" integer DEFAULT 4096 NOT NULL,
	"max_requests_per_minute" integer DEFAULT 60 NOT NULL,
	"max_concurrent_requests" integer DEFAULT 10 NOT NULL,
	"cpu_allocation" text DEFAULT 'standard' NOT NULL,
	"memory_allocation" text DEFAULT 'standard' NOT NULL,
	"cost_per_request" real DEFAULT 0 NOT NULL,
	"monthly_budget_limit" real,
	"current_month_usage" real DEFAULT 0 NOT NULL,
	"owner_can_see_real_cost" boolean DEFAULT true NOT NULL,
	"subscriber_can_see_cost" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_provider_adapters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_key" text NOT NULL,
	"display_name" text NOT NULL,
	"display_name_ar" text,
	"base_url" text,
	"api_version" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"supported_capabilities" jsonb DEFAULT '[]'::jsonb,
	"rate_limit_per_minute" integer DEFAULT 100,
	"is_healthy" boolean DEFAULT true NOT NULL,
	"last_health_check" timestamp,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_provider_adapters_provider_key_unique" UNIQUE("provider_key")
);
--> statement-breakpoint
CREATE TABLE "ai_provider_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"display_name" text NOT NULL,
	"encrypted_api_key" text,
	"api_key_prefix" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'disabled' NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"capabilities" jsonb DEFAULT '["chat","coding"]'::jsonb,
	"default_model" text,
	"base_url" text,
	"last_failure_at" timestamp,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"is_healthy" boolean DEFAULT true NOT NULL,
	"last_tested_at" timestamp,
	"last_test_result" text,
	"last_test_error" text,
	"current_balance" real,
	"low_balance_threshold" real DEFAULT 10,
	"last_balance_check_at" timestamp,
	"balance_check_error" text,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"probability" real DEFAULT 0 NOT NULL,
	"impact" text DEFAULT 'medium' NOT NULL,
	"timeline" text DEFAULT '3 months' NOT NULL,
	"ai_analysis" text,
	"ai_analysis_ar" text,
	"recommendations" jsonb,
	"recommendations_ar" jsonb,
	"predicted_outcomes" jsonb,
	"forecast_run_id" varchar,
	"created_by" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_service_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_name" text NOT NULL,
	"display_name" text NOT NULL,
	"display_name_ar" text,
	"description" text,
	"description_ar" text,
	"service_type" text DEFAULT 'chat' NOT NULL,
	"ai_mode" text DEFAULT 'auto' NOT NULL,
	"sidebar_path" text,
	"icon" text,
	"sort_order" integer DEFAULT 50,
	"primary_model_id" text,
	"fallback_model_id" text,
	"preferred_capabilities" jsonb DEFAULT '[]'::jsonb,
	"required_capabilities" jsonb DEFAULT '[]'::jsonb,
	"performance_mode" text DEFAULT 'balanced',
	"cost_sensitivity" text DEFAULT 'medium',
	"max_input_tokens" integer DEFAULT 50000,
	"max_output_tokens" integer DEFAULT 4096,
	"system_prompt" text,
	"system_prompt_ar" text,
	"temperature" real DEFAULT 0.7,
	"rate_limit" integer DEFAULT 100,
	"rate_limit_window" integer DEFAULT 60,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_service_configs_service_name_unique" UNIQUE("service_name")
);
--> statement-breakpoint
CREATE TABLE "ai_sovereignty_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"performed_by" varchar NOT NULL,
	"performer_role" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" varchar,
	"previous_state" jsonb,
	"new_state" jsonb,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now(),
	"checksum" text,
	"is_exportable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_task_executions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instruction_id" varchar NOT NULL,
	"assistant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"model" text NOT NULL,
	"provider" text NOT NULL,
	"execution_mode" text DEFAULT 'AUTO' NOT NULL,
	"input_prompt" text NOT NULL,
	"system_prompt" text,
	"output_response" text,
	"input_tokens" integer DEFAULT 0,
	"output_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"real_cost_usd" real DEFAULT 0,
	"billed_cost_usd" real DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"execution_time_ms" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_task_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"type" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"input" jsonb NOT NULL,
	"output" jsonb,
	"assigned_model" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"generation_type" text NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"month" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost" real DEFAULT 0 NOT NULL,
	"request_type" text DEFAULT 'chat' NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"latency_ms" integer,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_usage_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_role" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"daily_request_limit" integer DEFAULT 10 NOT NULL,
	"monthly_request_limit" integer DEFAULT 100 NOT NULL,
	"max_tokens_per_request" integer DEFAULT 2000 NOT NULL,
	"daily_cost_limit" integer DEFAULT 100 NOT NULL,
	"monthly_cost_limit" integer DEFAULT 1000 NOT NULL,
	"allowed_models" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allow_code_generation" boolean DEFAULT true NOT NULL,
	"allow_image_generation" boolean DEFAULT false NOT NULL,
	"allow_vision" boolean DEFAULT false NOT NULL,
	"requests_per_minute" integer DEFAULT 5 NOT NULL,
	"requests_per_hour" integer DEFAULT 50 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_usage_policies_plan_role_unique" UNIQUE("plan_role")
);
--> statement-breakpoint
CREATE TABLE "ai_usage_stats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"date" timestamp NOT NULL,
	"total_requests" integer DEFAULT 0 NOT NULL,
	"successful_requests" integer DEFAULT 0 NOT NULL,
	"failed_requests" integer DEFAULT 0 NOT NULL,
	"total_input_tokens" integer DEFAULT 0 NOT NULL,
	"total_output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"total_estimated_cost" real DEFAULT 0 NOT NULL,
	"avg_latency_ms" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analysis_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"type" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"pattern" text NOT NULL,
	"pattern_type" text DEFAULT 'regex' NOT NULL,
	"target_files" jsonb DEFAULT '["html","css","js"]'::jsonb,
	"suggestion_title" text NOT NULL,
	"suggestion_title_ar" text NOT NULL,
	"suggestion_description" text NOT NULL,
	"suggestion_description_ar" text NOT NULL,
	"suggested_fix" text,
	"suggested_fix_ar" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_built_in" boolean DEFAULT false NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"project_id" varchar,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"country" text,
	"city" text,
	"referrer" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"api_key_id" varchar,
	"user_id" varchar,
	"action" text NOT NULL,
	"action_ar" text,
	"resource_type" text,
	"resource_id" varchar,
	"previous_state" jsonb,
	"new_state" jsonb,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"geo_location" jsonb,
	"severity" text DEFAULT 'info' NOT NULL,
	"checksum" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_configuration" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_api_enabled" boolean DEFAULT true NOT NULL,
	"default_rate_limit_tier" text DEFAULT 'standard' NOT NULL,
	"max_keys_per_tenant" integer DEFAULT 10 NOT NULL,
	"key_expiration_days" integer,
	"require_scope_selection" boolean DEFAULT true NOT NULL,
	"allowed_ip_ranges" jsonb,
	"blocked_ip_ranges" jsonb,
	"cors_origins" jsonb,
	"webhooks_enabled" boolean DEFAULT true NOT NULL,
	"max_webhooks_per_tenant" integer DEFAULT 5 NOT NULL,
	"audit_retention_days" integer DEFAULT 365 NOT NULL,
	"custom_settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "api_configuration_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "api_key_usage_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" integer NOT NULL,
	"request_size" integer,
	"response_size" integer,
	"response_time_ms" integer,
	"ip_address" text,
	"user_agent" text,
	"scope_used" text,
	"is_rate_limited" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"last_four_chars" text NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"rate_limit_tier" text DEFAULT 'standard' NOT NULL,
	"rate_limit_per_minute" integer DEFAULT 60 NOT NULL,
	"rate_limit_per_hour" integer DEFAULT 1000 NOT NULL,
	"rate_limit_per_day" integer DEFAULT 10000 NOT NULL,
	"last_used_at" timestamp,
	"last_used_ip" text,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"revoked_by" varchar,
	"revoked_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_ai_generations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"prompt" text NOT NULL,
	"generation_type" text NOT NULL,
	"result" jsonb,
	"tokens_used" integer,
	"model_used" text,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_build_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"platform" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"duration_seconds" integer,
	"artifact_url" text,
	"artifact_size" integer,
	"logs" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"platform" text NOT NULL,
	"framework" text NOT NULL,
	"app_icon" text,
	"primary_color" text DEFAULT '#6366f1',
	"features" jsonb DEFAULT '{}'::jsonb,
	"window_settings" jsonb,
	"ai_generated_specs" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"build_progress" integer DEFAULT 0,
	"build_logs" jsonb DEFAULT '[]'::jsonb,
	"android_apk_url" text,
	"ios_ipa_url" text,
	"windows_exe_url" text,
	"mac_dmg_url" text,
	"linux_appimage_url" text,
	"last_build_at" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "architecture_patterns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"pattern_type" text NOT NULL,
	"pattern_name" text NOT NULL,
	"pattern_name_ar" text,
	"is_detected" boolean DEFAULT true NOT NULL,
	"is_suggested" boolean DEFAULT false NOT NULL,
	"confidence" real DEFAULT 1,
	"description" text,
	"description_ar" text,
	"benefits" jsonb DEFAULT '[]'::jsonb,
	"drawbacks" jsonb DEFAULT '[]'::jsonb,
	"is_anti_pattern" boolean DEFAULT false NOT NULL,
	"anti_pattern_reason" text,
	"suggested_fix" text,
	"performance_impact" text,
	"scalability_impact" text,
	"cost_impact" text,
	"security_impact" text,
	"affected_nodes" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'detected' NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationship_id" varchar,
	"workgroup_id" varchar,
	"sender_assistant_id" varchar NOT NULL,
	"receiver_assistant_id" varchar,
	"message_type" text DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"task_id" varchar,
	"priority" text DEFAULT 'normal',
	"requires_response" boolean DEFAULT false NOT NULL,
	"response_deadline" timestamp,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"response_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_instructions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assistant_id" varchar NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"instruction" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"response" text,
	"code_generated" text,
	"files_affected" jsonb DEFAULT '[]'::jsonb,
	"execution_time" integer,
	"approval_required" boolean DEFAULT true NOT NULL,
	"is_approved" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assistant_permission_audit" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"assistant_id" varchar,
	"action" text NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb,
	"actor_id" varchar NOT NULL,
	"actor_role" text,
	"reason" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_relationships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_assistant_id" varchar NOT NULL,
	"target_assistant_id" varchar NOT NULL,
	"relationship_type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"trust_score" integer DEFAULT 80 NOT NULL,
	"channel_enabled" boolean DEFAULT true NOT NULL,
	"can_delegate" boolean DEFAULT false NOT NULL,
	"can_override" boolean DEFAULT false NOT NULL,
	"can_request" boolean DEFAULT true NOT NULL,
	"can_supervise" boolean DEFAULT false NOT NULL,
	"shared_capabilities" jsonb DEFAULT '[]'::jsonb,
	"restricted_capabilities" jsonb DEFAULT '[]'::jsonb,
	"name_en" text,
	"name_ar" text,
	"description_en" text,
	"description_ar" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_workgroups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text,
	"description_ar" text,
	"member_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"leader_id" varchar,
	"purpose" text,
	"shared_capabilities" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assistant_workgroups_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "audit_findings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"classification" text NOT NULL,
	"score" real DEFAULT 0 NOT NULL,
	"test_results" jsonb,
	"failure_reason" text,
	"failure_reason_ar" text,
	"recommendation" text,
	"recommendation_ar" text,
	"recommendation_type" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"fix_status" text DEFAULT 'pending',
	"fixed_at" timestamp,
	"fixed_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" varchar,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_number" integer NOT NULL,
	"run_type" text DEFAULT 'full' NOT NULL,
	"scope" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"initiated_by" varchar,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_ms" integer,
	"total_targets" integer DEFAULT 0 NOT NULL,
	"tested_targets" integer DEFAULT 0 NOT NULL,
	"passed_targets" integer DEFAULT 0 NOT NULL,
	"failed_targets" integer DEFAULT 0 NOT NULL,
	"partial_targets" integer DEFAULT 0 NOT NULL,
	"readiness_score" real DEFAULT 0 NOT NULL,
	"breakdown" jsonb,
	"error_message" text,
	"previous_run_id" varchar,
	"change_from_previous" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_targets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"type" text NOT NULL,
	"path" text,
	"selector" text,
	"parent_id" varchar,
	"api_endpoint" text,
	"api_method" text,
	"discovered_at" timestamp DEFAULT now(),
	"last_tested_at" timestamp,
	"current_classification" text DEFAULT 'NON_OPERATIONAL',
	"current_score" real DEFAULT 0,
	"test_history" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"icon" text,
	"client_id" text,
	"client_secret_ref" text,
	"redirect_uri" text,
	"scopes" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_configured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_methods_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "billing_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"profile_name" text DEFAULT 'Default' NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"company_name" text,
	"company_name_ar" text,
	"tax_id" text,
	"tax_id_type" text,
	"billing_email" text,
	"billing_phone" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text DEFAULT 'SA' NOT NULL,
	"preferred_currency" text DEFAULT 'SAR' NOT NULL,
	"preferred_payment_method" text,
	"default_payment_method_id" varchar,
	"auto_pay_enabled" boolean DEFAULT true NOT NULL,
	"invoice_notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blueprints" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"context_domain" text,
	"context_platform" text DEFAULT 'web',
	"context_requirements" jsonb,
	"intents" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"constraints" jsonb,
	"outputs" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "branding_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownership_id" varchar NOT NULL,
	"asset_type" text NOT NULL,
	"asset_name" text NOT NULL,
	"content" text,
	"content_url" text,
	"mime_type" text,
	"file_size" integer,
	"is_encrypted" boolean DEFAULT true NOT NULL,
	"encryption_key_id" text,
	"encryption_algorithm" text DEFAULT 'AES-256-GCM',
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"access_level" text DEFAULT 'owner' NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "build_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"platform_version" text,
	"build_type" text DEFAULT 'release' NOT NULL,
	"bundle_id" text,
	"app_name" text NOT NULL,
	"app_name_ar" text,
	"version" text DEFAULT '1.0.0',
	"version_code" integer DEFAULT 1,
	"signing_config_ref" varchar,
	"certificate_type" text,
	"android_config" jsonb,
	"ios_config" jsonb,
	"desktop_config" jsonb,
	"icon_path" text,
	"splash_path" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "build_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"config_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"version" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0,
	"current_step" text,
	"current_step_ar" text,
	"build_logs" text,
	"error_message" text,
	"artifacts" jsonb DEFAULT '[]'::jsonb,
	"queued_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"welcome_message" text,
	"welcome_message_ar" text,
	"system_prompt" text NOT NULL,
	"primary_color" varchar(7) DEFAULT '#8B5CF6' NOT NULL,
	"position" text DEFAULT 'bottom-right' NOT NULL,
	"model" text DEFAULT 'gpt-4o' NOT NULL,
	"temperature" integer DEFAULT 70 NOT NULL,
	"max_tokens" integer DEFAULT 1000 NOT NULL,
	"suggested_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "code_analysis_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"analysis_type" text DEFAULT 'full' NOT NULL,
	"code_snapshot" jsonb,
	"total_suggestions" integer DEFAULT 0,
	"critical_issues" integer DEFAULT 0,
	"applied_suggestions" integer DEFAULT 0,
	"overall_score" integer DEFAULT 0,
	"performance_score" integer DEFAULT 0,
	"security_score" integer DEFAULT 0,
	"accessibility_score" integer DEFAULT 0,
	"seo_score" integer DEFAULT 0,
	"code_quality_score" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"error_message" text,
	"tokens_used" integer DEFAULT 0,
	"cost_usd" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_contexts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context_type" text NOT NULL,
	"context_path" text,
	"context_title" text NOT NULL,
	"context_description" text,
	"project_id" varchar,
	"created_by" varchar NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"participant_count" integer DEFAULT 0 NOT NULL,
	"actions_taken" integer DEFAULT 0 NOT NULL,
	"ai_interventions_active" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "collaboration_decisions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"decision_type" text NOT NULL,
	"proposed_by" varchar NOT NULL,
	"proposed_by_type" text DEFAULT 'user' NOT NULL,
	"proposed_at" timestamp DEFAULT now(),
	"approvers" jsonb DEFAULT '[]'::jsonb,
	"rejectors" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"executed_at" timestamp,
	"executed_by" varchar,
	"execution_result" jsonb,
	"impact_score" integer,
	"impact_description" text,
	"affected_files" jsonb DEFAULT '[]'::jsonb,
	"audit_trail" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "collaboration_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"sender_type" text DEFAULT 'user' NOT NULL,
	"sender_name" text NOT NULL,
	"sender_avatar" text,
	"content" text NOT NULL,
	"content_type" text DEFAULT 'text' NOT NULL,
	"code_reference" jsonb,
	"action_type" text,
	"action_executed" boolean DEFAULT false NOT NULL,
	"action_result" jsonb,
	"reply_to_id" varchar,
	"approvals" jsonb DEFAULT '[]'::jsonb,
	"rejections" jsonb DEFAULT '[]'::jsonb,
	"ai_confidence_score" real,
	"execution_time_ms" integer,
	"created_at" timestamp DEFAULT now(),
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "collaborators" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"invited_by" varchar NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"invite_email" text,
	"created_at" timestamp DEFAULT now(),
	"accepted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "command_auth_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"command_key" text,
	"max_risk_level" text DEFAULT 'high' NOT NULL,
	"factors_completed" jsonb NOT NULL,
	"device_id" text,
	"device_info" jsonb,
	"expires_at" timestamp NOT NULL,
	"is_remembered" boolean DEFAULT false NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"revoked_at" timestamp,
	"revoked_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "command_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"command_key" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text,
	"description_ar" text,
	"category" text NOT NULL,
	"risk_level" text DEFAULT 'medium' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"override_mfa" boolean,
	"override_factor_count" integer,
	"allowed_roles" text[] DEFAULT '{"owner"}' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "command_definitions_command_key_unique" UNIQUE("command_key")
);
--> statement-breakpoint
CREATE TABLE "command_execution_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"command_key" text NOT NULL,
	"command_category" text,
	"risk_level" text NOT NULL,
	"user_id" varchar NOT NULL,
	"auth_session_id" varchar,
	"factors_used" jsonb,
	"parameters" jsonb,
	"result" text NOT NULL,
	"error_message" text,
	"ip_address" text,
	"user_agent" text,
	"executed_at" timestamp DEFAULT now(),
	"duration_ms" integer
);
--> statement-breakpoint
CREATE TABLE "command_security_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"settings_key" text DEFAULT 'global' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"low_risk_requires_mfa" boolean DEFAULT false NOT NULL,
	"medium_risk_requires_mfa" boolean DEFAULT false NOT NULL,
	"high_risk_requires_mfa" boolean DEFAULT true NOT NULL,
	"critical_risk_requires_mfa" boolean DEFAULT true NOT NULL,
	"enabled_factors" jsonb DEFAULT '["password","otp_email","totp"]'::jsonb,
	"low_risk_factors" integer DEFAULT 1 NOT NULL,
	"medium_risk_factors" integer DEFAULT 1 NOT NULL,
	"high_risk_factors" integer DEFAULT 2 NOT NULL,
	"critical_risk_factors" integer DEFAULT 3 NOT NULL,
	"auth_session_duration" integer DEFAULT 15 NOT NULL,
	"remember_device_duration" integer DEFAULT 1440 NOT NULL,
	"max_failed_attempts" integer DEFAULT 5 NOT NULL,
	"lockout_duration" integer DEFAULT 30 NOT NULL,
	"notify_on_high_risk" boolean DEFAULT true NOT NULL,
	"notify_on_critical" boolean DEFAULT true NOT NULL,
	"notify_on_failed_attempt" boolean DEFAULT true NOT NULL,
	"log_all_commands" boolean DEFAULT true NOT NULL,
	"retention_days" integer DEFAULT 90 NOT NULL,
	"last_modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "command_security_settings_settings_key_unique" UNIQUE("settings_key")
);
--> statement-breakpoint
CREATE TABLE "compliance_frameworks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"code" text NOT NULL,
	"total_requirements" integer DEFAULT 0 NOT NULL,
	"passed_requirements" integer DEFAULT 0 NOT NULL,
	"failed_requirements" integer DEFAULT 0 NOT NULL,
	"pending_requirements" integer DEFAULT 0 NOT NULL,
	"compliance_score" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'partial' NOT NULL,
	"last_assessed_at" timestamp,
	"next_assessment_due" timestamp,
	"is_certified" boolean DEFAULT false NOT NULL,
	"certification_date" timestamp,
	"certification_expiry" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "compliance_frameworks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "compliance_indicators" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" varchar NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"standard" text,
	"standard_section" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"evidence" text,
	"evidence_ar" text,
	"assessed_at" timestamp,
	"assessed_by" varchar,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "components" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"category" text NOT NULL,
	"industry" text,
	"html_code" text NOT NULL,
	"css_code" text NOT NULL,
	"js_code" text DEFAULT '' NOT NULL,
	"thumbnail" text,
	"framework" text DEFAULT 'vanilla' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"required_plan" text DEFAULT 'free' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "console_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"instance_id" varchar,
	"log_type" text DEFAULT 'stdout' NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_scans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"scan_type" text DEFAULT 'full' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"violations" jsonb DEFAULT '[]'::jsonb,
	"content_score" integer DEFAULT 100,
	"scan_duration" integer,
	"ai_model" text DEFAULT 'claude-3-5-sonnet',
	"scanned_content" jsonb,
	"summary" text,
	"recommendations" jsonb,
	"triggered_by" text DEFAULT 'system' NOT NULL,
	"triggered_by_user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_disputes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" varchar NOT NULL,
	"filed_by" varchar NOT NULL,
	"against_party" varchar NOT NULL,
	"dispute_type" text NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"evidence" jsonb,
	"claimed_amount" real,
	"currency" text DEFAULT 'SAR',
	"status" text DEFAULT 'open' NOT NULL,
	"resolution_type" text,
	"resolution_summary_en" text,
	"resolution_summary_ar" text,
	"resolved_at" timestamp,
	"assigned_to" varchar,
	"filed_at" timestamp DEFAULT now(),
	"respond_by_date" timestamp,
	"last_activity_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_signatures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" varchar NOT NULL,
	"signer_id" varchar NOT NULL,
	"signer_role" text NOT NULL,
	"signature_type" text NOT NULL,
	"signature_data" text,
	"signature_hash" text,
	"verification_method" text,
	"verification_code" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	"device_fingerprint" text,
	"geo_location" text,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"dispute_resolution_accepted" boolean DEFAULT false NOT NULL,
	"signed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"contract_type" text NOT NULL,
	"content_en" text NOT NULL,
	"content_ar" text NOT NULL,
	"variables" jsonb,
	"required_clauses" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"legal_reviewed_by" text,
	"legal_reviewed_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "contract_templates_template_code_unique" UNIQUE("template_code")
);
--> statement-breakpoint
CREATE TABLE "conversation_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"content_ar" text,
	"is_encrypted" boolean DEFAULT true NOT NULL,
	"token_count" integer,
	"model_used" varchar(50),
	"generation_time" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_restore_points" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"name" text,
	"description" text,
	"encrypted_snapshot" text NOT NULL,
	"message_count" integer NOT NULL,
	"last_message_id" varchar,
	"restored_count" integer DEFAULT 0 NOT NULL,
	"last_restored_at" timestamp,
	"is_automatic" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversation_search_index" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"message_id" varchar NOT NULL,
	"keyword_hashes" jsonb NOT NULL,
	"detected_language" text,
	"message_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_attributions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"source_id" varchar NOT NULL,
	"source_name" text,
	"cost_type" text NOT NULL,
	"real_cost_usd" real DEFAULT 0 NOT NULL,
	"hidden_cost_usd" real DEFAULT 0 NOT NULL,
	"total_cost_usd" real DEFAULT 0 NOT NULL,
	"billed_cost_usd" real DEFAULT 0 NOT NULL,
	"margin_usd" real DEFAULT 0 NOT NULL,
	"margin_percent" real DEFAULT 0 NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"unit_type" text,
	"unit_cost" real DEFAULT 0 NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "csr_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"domain" text NOT NULL,
	"organization" text,
	"organization_unit" text,
	"city" text,
	"state" text,
	"country" text DEFAULT 'SA' NOT NULL,
	"email" text,
	"csr_content" text NOT NULL,
	"private_key_encrypted" text NOT NULL,
	"status" text DEFAULT 'generated' NOT NULL,
	"provider" text DEFAULT 'namecheap' NOT NULL,
	"certificate_id" varchar,
	"submitted_at" timestamp,
	"issued_at" timestamp,
	"expires_at" timestamp,
	"notes" text,
	"notes_ar" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_domains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"owner_user_id" varchar,
	"project_id" varchar,
	"hostname" text NOT NULL,
	"root_domain" text NOT NULL,
	"is_system_domain" boolean DEFAULT false NOT NULL,
	"visibility" text DEFAULT 'tenant' NOT NULL,
	"registrar_provider" text,
	"purchased_at" timestamp,
	"purchase_price" integer,
	"purchase_currency" text DEFAULT 'USD',
	"renewal_price" integer,
	"expires_at" timestamp,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"status_message" text,
	"status_message_ar" text,
	"verification_method" text DEFAULT 'dns_txt' NOT NULL,
	"verification_token" text NOT NULL,
	"verification_expires_at" timestamp,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"is_primary" boolean DEFAULT false NOT NULL,
	"dns_provider" text,
	"ssl_status" text DEFAULT 'none' NOT NULL,
	"ssl_issued_at" timestamp,
	"ssl_expires_at" timestamp,
	"ssl_auto_renew" boolean DEFAULT true NOT NULL,
	"last_check_at" timestamp,
	"check_attempts" integer DEFAULT 0 NOT NULL,
	"max_check_attempts" integer DEFAULT 10 NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "custom_domains_hostname_unique" UNIQUE("hostname")
);
--> statement-breakpoint
CREATE TABLE "daily_usage_aggregates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"total_requests" integer DEFAULT 0 NOT NULL,
	"successful_requests" integer DEFAULT 0 NOT NULL,
	"failed_requests" integer DEFAULT 0 NOT NULL,
	"total_ai_tokens" integer DEFAULT 0 NOT NULL,
	"total_api_requests" integer DEFAULT 0 NOT NULL,
	"total_storage_mb" real DEFAULT 0 NOT NULL,
	"total_bandwidth_mb" real DEFAULT 0 NOT NULL,
	"real_cost_usd" real DEFAULT 0 NOT NULL,
	"billed_cost_usd" real DEFAULT 0 NOT NULL,
	"margin_usd" real DEFAULT 0 NOT NULL,
	"country_code" text,
	"cost_by_provider" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"policy_type" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_policy_regions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" varchar,
	"region_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_region_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_id" varchar,
	"active_users" integer DEFAULT 0 NOT NULL,
	"data_volume_bytes" text DEFAULT '0' NOT NULL,
	"transfer_count" integer DEFAULT 0 NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"metric_date" timestamp DEFAULT now() NOT NULL,
	"last_synced_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_regions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"code" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"compliance" jsonb DEFAULT '[]'::jsonb,
	"data_storage_allowed" boolean DEFAULT true NOT NULL,
	"data_processing_allowed" boolean DEFAULT true NOT NULL,
	"data_transfer_allowed" boolean DEFAULT false NOT NULL,
	"flag_icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "data_regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "dead_letter_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"error_message" text NOT NULL,
	"error_stack" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"last_retry_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deleted_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"entity_name" text NOT NULL,
	"entity_data" jsonb DEFAULT '{}'::jsonb,
	"deleted_by" varchar NOT NULL,
	"deleted_by_role" text NOT NULL,
	"deleted_by_email" text,
	"deleted_by_full_name" text,
	"deleted_by_account_status" text,
	"deleted_at" timestamp DEFAULT now(),
	"deleted_at_local" text,
	"deletion_type" text DEFAULT 'manual' NOT NULL,
	"deletion_reason" text,
	"retention_days" integer DEFAULT 30 NOT NULL,
	"expires_at" timestamp,
	"device_type" text,
	"operating_system" text,
	"browser" text,
	"app_version" text,
	"ip_address" text,
	"country" text,
	"region" text,
	"session_id" varchar,
	"platform_type" text,
	"platform_domain" text,
	"data_size" text,
	"user_count" integer,
	"deployment_status" text,
	"status" text DEFAULT 'recoverable' NOT NULL,
	"recovered_at" timestamp,
	"recovered_by" varchar,
	"recovery_type" text,
	"audit_trail" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "deleted_platforms_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_id" varchar NOT NULL,
	"original_type" text NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"deletion_phase" text DEFAULT 'warning_shown' NOT NULL,
	"warning_shown_at" timestamp,
	"confirmed_at" timestamp,
	"password_verified_at" timestamp,
	"soft_deleted_at" timestamp,
	"permanent_delete_scheduled_at" timestamp,
	"permanently_deleted_at" timestamp,
	"full_backup" jsonb,
	"backup_size_bytes" integer,
	"can_restore" boolean DEFAULT true NOT NULL,
	"restore_deadline" timestamp NOT NULL,
	"restored_at" timestamp,
	"restored_by" varchar,
	"permanent_deleted_by" varchar,
	"permanent_delete_reason" text,
	"sovereign_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deletion_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"entity_name" text,
	"entity_details" jsonb DEFAULT '{}'::jsonb,
	"attempted_at" timestamp DEFAULT now(),
	"outcome" text NOT NULL,
	"failure_reason" text,
	"ip_address" text,
	"user_agent" text,
	"browser" text,
	"operating_system" text,
	"device" text,
	"location" jsonb DEFAULT '{}'::jsonb,
	"email_sent" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "deletion_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"action_by" varchar NOT NULL,
	"action_by_role" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" varchar NOT NULL,
	"target_name" text,
	"previous_state" jsonb DEFAULT '{}'::jsonb,
	"new_state" jsonb DEFAULT '{}'::jsonb,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"session_id" varchar,
	"is_gdpr_related" boolean DEFAULT false NOT NULL,
	"compliance_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "department_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"title" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"parent_id" varchar,
	"manager_id" varchar,
	"color" text DEFAULT '#3b82f6',
	"icon" text DEFAULT 'building',
	"status" text DEFAULT 'active' NOT NULL,
	"member_count" integer DEFAULT 0,
	"max_members" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployment_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"environment" text DEFAULT 'production' NOT NULL,
	"provider" text NOT NULL,
	"domain" text,
	"custom_domain" text,
	"ssl_enabled" boolean DEFAULT true NOT NULL,
	"cdn_enabled" boolean DEFAULT false NOT NULL,
	"auto_scale" boolean DEFAULT false NOT NULL,
	"min_instances" integer DEFAULT 1,
	"max_instances" integer DEFAULT 5,
	"health_check_path" text DEFAULT '/health',
	"health_check_interval" integer DEFAULT 30,
	"env_vars_ref" varchar,
	"auto_deploy" boolean DEFAULT true NOT NULL,
	"deploy_branch" text DEFAULT 'main',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployment_manifests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"deployment_id" varchar,
	"name" text NOT NULL,
	"manifest_type" text NOT NULL,
	"version" text DEFAULT '1.0.0',
	"content" text NOT NULL,
	"content_hash" text,
	"variables" jsonb DEFAULT '{}'::jsonb,
	"secrets" jsonb DEFAULT '[]'::jsonb,
	"target_environment" text DEFAULT 'production',
	"target_provider" text,
	"target_region" text,
	"is_validated" boolean DEFAULT false,
	"validation_errors" jsonb DEFAULT '[]'::jsonb,
	"last_validated_at" timestamp,
	"last_applied_at" timestamp,
	"last_applied_by" varchar,
	"apply_status" text,
	"apply_output" text,
	"state_storage_path" text,
	"state_locked" boolean DEFAULT false,
	"state_locked_by" varchar,
	"state_locked_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deployment_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"template_id" varchar,
	"server_id" varchar NOT NULL,
	"name" text NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"environment" text DEFAULT 'production' NOT NULL,
	"git_repo" text,
	"git_branch" text DEFAULT 'main',
	"git_commit" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"deployed_url" text,
	"health_status" text DEFAULT 'unknown',
	"error_message" text,
	"error_details" jsonb,
	"deployment_mode" text DEFAULT 'auto' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"can_rollback" boolean DEFAULT false NOT NULL,
	"previous_version" text,
	"rolled_back_at" timestamp,
	"rolled_back_by" varchar,
	"initiated_by" varchar NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deployment_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"icon" text DEFAULT 'box',
	"type" text NOT NULL,
	"category" text DEFAULT 'web' NOT NULL,
	"min_cpu" integer DEFAULT 1,
	"min_ram" integer DEFAULT 1,
	"min_storage" integer DEFAULT 10,
	"recommended_server_type" text,
	"docker_image" text,
	"docker_compose" text,
	"environment_variables" jsonb DEFAULT '[]'::jsonb,
	"build_command" text,
	"start_command" text,
	"health_check_path" text DEFAULT '/health',
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"config_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"version" text NOT NULL,
	"commit_hash" text,
	"commit_message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"build_logs" text,
	"deployment_url" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration" integer,
	"is_rollback" boolean DEFAULT false NOT NULL,
	"rolled_back_from" varchar,
	"build_size" integer,
	"assets_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_build_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"build_number" integer NOT NULL,
	"project_id" varchar NOT NULL,
	"workspace_id" varchar NOT NULL,
	"triggered_by" varchar,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"trigger_ref" varchar(255),
	"commit_hash" varchar(40),
	"commit_message" text,
	"build_command" text NOT NULL,
	"output_directory" text,
	"node_version" varchar(20),
	"status" text DEFAULT 'queued' NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"logs" text,
	"log_url" text,
	"artifacts" jsonb DEFAULT '[]'::jsonb,
	"metrics" jsonb,
	"queued_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_ms" integer,
	"error_message" text,
	"error_step" text,
	"environment" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dev_commands" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"command_number" integer NOT NULL,
	"project_id" varchar NOT NULL,
	"workspace_id" varchar NOT NULL,
	"executed_by" varchar NOT NULL,
	"command_type" text NOT NULL,
	"command" text NOT NULL,
	"arguments" jsonb DEFAULT '[]'::jsonb,
	"working_directory" text DEFAULT '/' NOT NULL,
	"environment" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"exit_code" integer,
	"stdout" text,
	"stderr" text,
	"combined_output" text,
	"output_truncated" boolean DEFAULT false NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_ms" integer,
	"resource_usage" jsonb,
	"error_message" text,
	"error_stack" text,
	"integrity_hash" varchar(64) NOT NULL,
	"previous_command_hash" varchar(64),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dev_database_columns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_id" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"column_name" text NOT NULL,
	"column_name_display" text,
	"column_name_display_ar" text,
	"data_type" text NOT NULL,
	"is_nullable" boolean DEFAULT true NOT NULL,
	"is_unique" boolean DEFAULT false NOT NULL,
	"default_value" text,
	"min_length" integer,
	"max_length" integer,
	"min_value" text,
	"max_value" text,
	"pattern" text,
	"references_table" varchar,
	"references_column" varchar,
	"on_delete" text DEFAULT 'CASCADE',
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_searchable" boolean DEFAULT false NOT NULL,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dev_database_relationships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"relationship_name" text NOT NULL,
	"relationship_type" text NOT NULL,
	"source_table_id" varchar NOT NULL,
	"source_column_id" varchar,
	"target_table_id" varchar NOT NULL,
	"target_column_id" varchar,
	"junction_table_name" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dev_database_tables" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"table_name" text NOT NULL,
	"table_name_display" text,
	"table_name_display_ar" text,
	"description" text,
	"description_ar" text,
	"has_primary_key" boolean DEFAULT true NOT NULL,
	"primary_key_type" text DEFAULT 'uuid',
	"has_timestamps" boolean DEFAULT true NOT NULL,
	"is_soft_delete" boolean DEFAULT false NOT NULL,
	"generate_crud_api" boolean DEFAULT true NOT NULL,
	"api_prefix" text DEFAULT '/api',
	"require_auth" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_migrated" boolean DEFAULT false NOT NULL,
	"migration_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dev_deploy_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deploy_number" integer NOT NULL,
	"project_id" varchar NOT NULL,
	"workspace_id" varchar NOT NULL,
	"build_run_id" varchar,
	"triggered_by" varchar,
	"environment" text DEFAULT 'production' NOT NULL,
	"commit_hash" varchar(40),
	"commit_message" text,
	"branch" varchar(255),
	"status" text DEFAULT 'queued' NOT NULL,
	"provider" text NOT NULL,
	"region" varchar(50),
	"url" text,
	"preview_url" text,
	"alias_urls" jsonb DEFAULT '[]'::jsonb,
	"domains" jsonb DEFAULT '[]'::jsonb,
	"deployment_id" varchar(255),
	"steps" jsonb DEFAULT '[]'::jsonb,
	"logs" text,
	"log_url" text,
	"metrics" jsonb,
	"queued_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_ms" integer,
	"is_rollback" boolean DEFAULT false NOT NULL,
	"rolled_back_from_id" varchar,
	"rolled_back_at" timestamp,
	"rolled_back_by" varchar,
	"error_message" text,
	"error_code" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dev_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"project_id" varchar NOT NULL,
	"parent_id" varchar,
	"file_type" text DEFAULT 'file' NOT NULL,
	"mime_type" varchar(100),
	"content" text,
	"binary_url" text,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"encoding" varchar(20) DEFAULT 'utf-8',
	"line_count" integer,
	"git_status" text,
	"last_commit_hash" varchar(40),
	"version" integer DEFAULT 1 NOT NULL,
	"checksum" varchar(64),
	"is_read_only" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"last_modified_by" varchar,
	"last_modified_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "isds_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"workspace_id" varchar NOT NULL,
	"template_id" varchar,
	"project_type" text DEFAULT 'web' NOT NULL,
	"framework" text,
	"language" text DEFAULT 'typescript' NOT NULL,
	"status" text DEFAULT 'initializing' NOT NULL,
	"git_config" jsonb DEFAULT '{"branch":"main"}'::jsonb,
	"build_config" jsonb,
	"deploy_config" jsonb,
	"dependencies" jsonb DEFAULT '{"production":{},"development":{}}'::jsonb,
	"metrics" jsonb,
	"icon" text,
	"color" varchar(7),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"last_activity_at" timestamp,
	"last_build_at" timestamp,
	"last_deploy_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dev_workspaces" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"description_ar" text,
	"owner_id" varchar NOT NULL,
	"organization_id" varchar,
	"visibility" text DEFAULT 'private' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"settings" jsonb DEFAULT '{"defaultBranch":"main","autoSave":true,"autoFormat":true,"theme":"dark","fontSize":14,"tabSize":2,"enableAI":true,"aiModel":"claude-3-5-sonnet"}'::jsonb,
	"limits" jsonb,
	"usage" jsonb DEFAULT '{"projectCount":0,"storageUsedMB":0,"buildMinutesUsed":0,"deploymentCount":0}'::jsonb,
	"icon" text,
	"color" varchar(7),
	"metadata" jsonb,
	"last_accessed_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dev_workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "digital_contracts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_number" text NOT NULL,
	"contract_type" text NOT NULL,
	"template_id" varchar,
	"ownership_id" varchar,
	"license_id" varchar,
	"seller_id" varchar NOT NULL,
	"buyer_id" varchar NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text NOT NULL,
	"content_en" text NOT NULL,
	"content_ar" text NOT NULL,
	"is_encrypted" boolean DEFAULT true NOT NULL,
	"included_clauses" jsonb,
	"effective_date" timestamp,
	"expiry_date" timestamp,
	"total_value" real,
	"currency" text DEFAULT 'SAR',
	"payment_terms" text,
	"payment_schedule" jsonb,
	"owner_retains_ip" boolean DEFAULT true NOT NULL,
	"non_compete_period_months" integer,
	"revenue_share_post_sale" real,
	"audit_rights" boolean DEFAULT true NOT NULL,
	"usage_same_name" boolean DEFAULT false NOT NULL,
	"usage_different_name" boolean DEFAULT true NOT NULL,
	"usage_modification_allowed" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sent_for_signature_at" timestamp,
	"seller_signed_at" timestamp,
	"buyer_signed_at" timestamp,
	"activated_at" timestamp,
	"terminated_at" timestamp,
	"termination_reason" text,
	"content_hash" text,
	"metadata" jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "digital_contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "domain_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"action" text NOT NULL,
	"action_ar" text,
	"performed_by" varchar NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"details" jsonb,
	"ip_address" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "domain_platform_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" varchar NOT NULL,
	"platform_id" varchar NOT NULL,
	"subdomain" text,
	"target_type" text DEFAULT 'server' NOT NULL,
	"target_address" text NOT NULL,
	"target_port" integer,
	"ssl_enabled" boolean DEFAULT true NOT NULL,
	"ssl_certificate_id" varchar,
	"ssl_expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "domain_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" varchar NOT NULL,
	"method" text NOT NULL,
	"token" text NOT NULL,
	"expected_value" text NOT NULL,
	"actual_value" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"next_attempt_at" timestamp,
	"verified_at" timestamp,
	"expires_at" timestamp,
	"error_message" text,
	"error_message_ar" text,
	"verified_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dynamic_api_endpoints" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"method" text DEFAULT 'GET' NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"required_role" text,
	"rate_limit" integer DEFAULT 100,
	"query_type" text DEFAULT 'select' NOT NULL,
	"table_name" text,
	"allowed_fields" jsonb DEFAULT '[]'::jsonb,
	"filters" jsonb DEFAULT '{}'::jsonb,
	"transformations" jsonb DEFAULT '{}'::jsonb,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dynamic_api_endpoints_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "dynamic_components" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_owner_only" boolean DEFAULT false NOT NULL,
	"props" jsonb DEFAULT '{}'::jsonb,
	"styles" jsonb DEFAULT '{}'::jsonb,
	"layout" jsonb DEFAULT '{}'::jsonb,
	"data_source" text,
	"refresh_interval" integer DEFAULT 0,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dynamic_components_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "dynamic_features" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"category" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_owner_only" boolean DEFAULT false NOT NULL,
	"is_beta" boolean DEFAULT false NOT NULL,
	"rollout_percentage" integer DEFAULT 100 NOT NULL,
	"dependencies" jsonb DEFAULT '[]'::jsonb,
	"config" jsonb DEFAULT '{}'::jsonb,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dynamic_features_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "dynamic_pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pathname" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_owner_only" boolean DEFAULT false NOT NULL,
	"is_sovereign_only" boolean DEFAULT false NOT NULL,
	"required_role" text,
	"category" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"parent_path" text,
	"dynamic_score" integer DEFAULT 100 NOT NULL,
	"content_source" text DEFAULT 'database' NOT NULL,
	"cache_strategy" text DEFAULT 'realtime' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dynamic_pages_pathname_unique" UNIQUE("pathname")
);
--> statement-breakpoint
CREATE TABLE "dynamic_workflows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"trigger" text NOT NULL,
	"trigger_config" jsonb DEFAULT '{}'::jsonb,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_autonomous" boolean DEFAULT false NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dynamic_workflows_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "emergency_controls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"scope" text DEFAULT 'global' NOT NULL,
	"scope_value" text,
	"reason" text NOT NULL,
	"reason_ar" text,
	"activated_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"activated_at" timestamp DEFAULT now(),
	"deactivated_at" timestamp,
	"deactivated_by" varchar,
	"auto_deactivate_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text,
	"description_ar" text,
	"assigned_to" varchar,
	"assigned_by" varchar NOT NULL,
	"department_id" varchar,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"progress" integer DEFAULT 0,
	"estimated_hours" real,
	"actual_hours" real,
	"notes" text,
	"completion_notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encrypted_ai_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"owner_id" varchar,
	"owner_name" text,
	"title" text,
	"title_ar" text,
	"encryption_version" text DEFAULT 'AES-256-GCM' NOT NULL,
	"key_id" text NOT NULL,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"auto_save_enabled" boolean DEFAULT true NOT NULL,
	"auto_save_interval_seconds" integer DEFAULT 120 NOT NULL,
	"last_auto_save_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"closed_at" timestamp,
	CONSTRAINT "encrypted_ai_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "encrypted_conversation_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"message_type" text NOT NULL,
	"sequence_number" integer NOT NULL,
	"encrypted_content" text NOT NULL,
	"encrypted_metadata" text,
	"searchable_hash" text,
	"token_count" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encryption_keys_registry" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_id" text NOT NULL,
	"algorithm" text DEFAULT 'AES-256-GCM' NOT NULL,
	"purpose" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"previous_key_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp,
	"revoked_reason" text,
	"expires_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"rotated_at" timestamp,
	CONSTRAINT "encryption_keys_registry_key_id_unique" UNIQUE("key_id")
);
--> statement-breakpoint
CREATE TABLE "event_store" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"aggregate_id" varchar,
	"aggregate_type" text,
	"tenant_id" varchar,
	"correlation_id" varchar,
	"causation_id" varchar,
	"sequence" integer NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"payload" jsonb NOT NULL,
	"metadata" jsonb,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "event_store_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "execution_artifacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar,
	"project_id" varchar,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"storage_type" text DEFAULT 'object',
	"storage_path" text NOT NULL,
	"storage_url" text,
	"checksum" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"expires_at" timestamp,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "execution_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"user_id" varchar,
	"runtime_id" varchar,
	"code" text,
	"command" text,
	"working_directory" text,
	"isolation_type" text DEFAULT 'container',
	"container_id" text,
	"container_name" text,
	"memory_mb" integer DEFAULT 512,
	"cpu_cores" real DEFAULT 0.5,
	"timeout_seconds" integer DEFAULT 300,
	"status" text DEFAULT 'pending',
	"exit_code" integer,
	"stdout" text,
	"stderr" text,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_ms" integer,
	"memory_used_mb" integer,
	"cpu_used_percent" real,
	"artifact_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "execution_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprint_id" varchar,
	"tenant_id" varchar,
	"objective" text NOT NULL,
	"goal_type" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estimated_duration" integer,
	"resource_requirements" jsonb,
	"completed_steps" jsonb DEFAULT '[]'::jsonb,
	"failed_step" text,
	"outputs" jsonb,
	"metrics" jsonb,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "execution_runtimes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"runtime_type" text NOT NULL,
	"version" text NOT NULL,
	"docker_image" text NOT NULL,
	"docker_registry" text DEFAULT 'docker.io',
	"default_memory_mb" integer DEFAULT 512,
	"max_memory_mb" integer DEFAULT 2048,
	"default_cpu_cores" real DEFAULT 0.5,
	"max_cpu_cores" real DEFAULT 4,
	"default_timeout_seconds" integer DEFAULT 300,
	"max_timeout_seconds" integer DEFAULT 3600,
	"supported_package_managers" jsonb DEFAULT '[]'::jsonb,
	"preinstalled_packages" jsonb DEFAULT '[]'::jsonb,
	"environment_variables" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "extension_registrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extension_id" varchar NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"description" text,
	"author" text,
	"extension_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hooks" jsonb,
	"config" jsonb,
	"tenant_id" varchar,
	"enabled" boolean DEFAULT false NOT NULL,
	"installed_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "extension_registrations_extension_id_unique" UNIQUE("extension_id")
);
--> statement-breakpoint
CREATE TABLE "external_ai_providers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"provider" text NOT NULL,
	"api_endpoint" text,
	"api_key_secret_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"allowed_for_subscribers" boolean DEFAULT false NOT NULL,
	"requires_owner_approval" boolean DEFAULT true NOT NULL,
	"linked_layer_ids" jsonb DEFAULT '[]'::jsonb,
	"rate_limit" integer DEFAULT 100,
	"monthly_budget" real,
	"current_month_spend" real DEFAULT 0 NOT NULL,
	"added_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "external_integration_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"operation_type" text NOT NULL,
	"operation_name" text NOT NULL,
	"operation_description" text,
	"request_data" jsonb,
	"response_data" jsonb,
	"affected_resources" jsonb DEFAULT '[]'::jsonb,
	"status" text NOT NULL,
	"error_message" text,
	"ip_address" text,
	"user_agent" text,
	"checksum" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "external_integration_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_name" text NOT NULL,
	"partner_display_name" text NOT NULL,
	"provider_type" text DEFAULT 'custom',
	"purpose" text NOT NULL,
	"purpose_description" text NOT NULL,
	"purpose_description_ar" text,
	"session_type" text DEFAULT 'standard',
	"priority" text DEFAULT 'normal',
	"server_connection" jsonb,
	"access_level" text DEFAULT 'read_only',
	"permissions" jsonb NOT NULL,
	"restrictions" jsonb NOT NULL,
	"contact_info" jsonb,
	"scheduled_start" timestamp,
	"scheduled_end" timestamp,
	"status" text DEFAULT 'inactive' NOT NULL,
	"activated_at" timestamp,
	"activated_by" varchar,
	"activation_reason" text,
	"mfa_required" boolean DEFAULT true NOT NULL,
	"mfa_verified_at" timestamp,
	"owner_signature" text,
	"expires_at" timestamp,
	"auto_close_after_task" boolean DEFAULT true NOT NULL,
	"deactivated_at" timestamp,
	"deactivated_by" varchar,
	"deactivation_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "failover_groups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"primary_provider_id" varchar,
	"fallback_provider_ids" jsonb DEFAULT '[]'::jsonb,
	"trigger_conditions" jsonb DEFAULT '{}'::jsonb,
	"auto_failover" boolean DEFAULT true NOT NULL,
	"last_failover_at" timestamp,
	"failover_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"rollout_percentage" integer DEFAULT 0 NOT NULL,
	"allowed_plans" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allowed_user_ids" jsonb DEFAULT '[]'::jsonb,
	"is_ab_test" boolean DEFAULT false NOT NULL,
	"variants" jsonb DEFAULT '[]'::jsonb,
	"start_date" timestamp,
	"end_date" timestamp,
	"category" text DEFAULT 'feature' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "finance_budgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"code" varchar(30) NOT NULL,
	"description" text,
	"period_type" text DEFAULT 'monthly' NOT NULL,
	"fiscal_year" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"allocated_amount" integer NOT NULL,
	"spent_amount" integer DEFAULT 0 NOT NULL,
	"committed_amount" integer DEFAULT 0 NOT NULL,
	"remaining_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"warning_threshold" integer DEFAULT 80,
	"critical_threshold" integer DEFAULT 95,
	"owner_id" varchar,
	"team_id" varchar,
	"project_id" varchar,
	"status" text DEFAULT 'draft' NOT NULL,
	"allow_carryover" boolean DEFAULT false NOT NULL,
	"carryover_amount" integer DEFAULT 0,
	"carryover_from_id" varchar,
	"approved_by" varchar,
	"approved_at" timestamp,
	"notes" text,
	"metadata" jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "finance_budgets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "finance_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"invoice_type" text DEFAULT 'invoice' NOT NULL,
	"customer_id" varchar,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_address" text,
	"customer_tax_id" varchar(50),
	"billing_address" jsonb,
	"line_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount_total" integer DEFAULT 0,
	"tax_total" integer DEFAULT 0,
	"total" integer DEFAULT 0 NOT NULL,
	"amount_paid" integer DEFAULT 0,
	"amount_due" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"issue_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"payment_terms" text,
	"payment_instructions" text,
	"notes" text,
	"notes_ar" text,
	"internal_notes" text,
	"project_id" varchar,
	"subscription_id" varchar,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurring_interval" text,
	"next_recurring_date" timestamp,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "finance_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "finance_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"reference_number" varchar(100),
	"entry_type" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"exchange_rate" real DEFAULT 1,
	"amount_in_base_currency" integer,
	"debit_account_id" varchar,
	"credit_account_id" varchar,
	"user_id" varchar,
	"team_id" varchar,
	"project_id" varchar,
	"invoice_id" varchar,
	"description" text NOT NULL,
	"description_ar" text,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"rejection_reason" text,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"posting_date" timestamp,
	"is_reconciled" boolean DEFAULT false NOT NULL,
	"reconciled_at" timestamp,
	"reconciled_by" varchar,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "finance_ledger_entry_number_unique" UNIQUE("entry_number")
);
--> statement-breakpoint
CREATE TABLE "finance_reconciliations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reconciliation_number" varchar(50) NOT NULL,
	"reconciliation_type" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"source_type" text NOT NULL,
	"source_reference" varchar(100),
	"target_type" text NOT NULL,
	"target_reference" varchar(100),
	"expected_amount" integer NOT NULL,
	"actual_amount" integer NOT NULL,
	"difference_amount" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"matched_items" jsonb DEFAULT '[]'::jsonb,
	"unmatched_items" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_to" varchar,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"resolution_notes" text,
	"adjustment_ledger_id" varchar,
	"notes" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "finance_reconciliations_reconciliation_number_unique" UNIQUE("reconciliation_number")
);
--> statement-breakpoint
CREATE TABLE "finance_teams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"code" varchar(20) NOT NULL,
	"description" text,
	"description_ar" text,
	"department_id" varchar,
	"parent_team_id" varchar,
	"manager_id" varchar,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"budget_limit" integer,
	"approval_threshold" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "finance_teams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "franchise_licenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_number" text NOT NULL,
	"ownership_id" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"licensee_id" varchar NOT NULL,
	"license_type" text NOT NULL,
	"usage_scope" text DEFAULT 'single' NOT NULL,
	"allowed_regions" jsonb,
	"excluded_regions" jsonb,
	"is_temporary" boolean DEFAULT true NOT NULL,
	"start_date" timestamp NOT NULL,
	"expiry_date" timestamp,
	"auto_renew" boolean DEFAULT false NOT NULL,
	"renewal_period_days" integer,
	"renewal_price" real,
	"last_renewal_at" timestamp,
	"license_price" real DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'SAR',
	"is_paid" boolean DEFAULT false NOT NULL,
	"payment_id" varchar,
	"revenue_share_percentage" real DEFAULT 0,
	"minimum_monthly_revenue" real,
	"allow_white_label" boolean DEFAULT false NOT NULL,
	"allow_branding_changes" boolean DEFAULT false NOT NULL,
	"allow_reselling" boolean DEFAULT false NOT NULL,
	"allowed_features" jsonb,
	"max_users" integer,
	"max_storage" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"status_reason" text,
	"status_changed_at" timestamp,
	"status_changed_by" varchar,
	"contract_id" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "franchise_licenses_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "health_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"deployment_id" varchar,
	"alert_type" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"message" text NOT NULL,
	"message_ar" text,
	"status" text DEFAULT 'active' NOT NULL,
	"acknowledged_at" timestamp,
	"acknowledged_by" varchar,
	"resolved_at" timestamp,
	"auto_heal_attempted" boolean DEFAULT false NOT NULL,
	"auto_heal_success" boolean,
	"auto_heal_action" text,
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hetzner_deployments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" integer NOT NULL,
	"project_id" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"server_name" text,
	"server_type" varchar(20),
	"location" varchar(20),
	"status" text DEFAULT 'active' NOT NULL,
	"ip_address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hetzner_deployments_server_id_unique" UNIQUE("server_id")
);
--> statement-breakpoint
CREATE TABLE "icon_regeneration_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_icon_id" varchar NOT NULL,
	"platform_id" text NOT NULL,
	"reason" text,
	"custom_prompt" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"result_version_id" varchar,
	"requested_by" varchar,
	"requested_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "immutable_audit_trail" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"previous_hash" text,
	"current_hash" text NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"timestamp_authority" text,
	"timestamp_signature" text,
	"merkle_root" text,
	"merkle_proof" jsonb,
	"block_number" integer,
	"actor_id" varchar,
	"actor_type" text,
	"actor_ip" text,
	"actor_device" text,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_agent_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"category" text DEFAULT 'general',
	"is_secret" boolean DEFAULT false NOT NULL,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "infera_agent_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "infera_agent_executions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"step_index" integer NOT NULL,
	"tool" text NOT NULL,
	"params" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"output" jsonb,
	"error" text,
	"duration_ms" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_agent_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"name" text NOT NULL,
	"extension" text,
	"content" text,
	"content_hash" text,
	"size" integer DEFAULT 0,
	"is_directory" boolean DEFAULT false NOT NULL,
	"project_id" varchar,
	"version" integer DEFAULT 1 NOT NULL,
	"previous_version_id" varchar,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "infera_agent_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar,
	"execution_id" varchar,
	"level" text DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"details" jsonb,
	"source" text DEFAULT 'agent',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_agent_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"prompt" text NOT NULL,
	"user_id" varchar,
	"project_id" varchar,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"plan" jsonb,
	"current_step" integer DEFAULT 0,
	"total_steps" integer DEFAULT 0,
	"result" jsonb,
	"context" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_ai_providers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"display_name_ar" text,
	"description" text,
	"description_ar" text,
	"icon" text,
	"base_url" text NOT NULL,
	"api_version" text,
	"auth_type" text DEFAULT 'bearer' NOT NULL,
	"auth_header" text DEFAULT 'Authorization',
	"available_models" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"health_score" integer DEFAULT 100,
	"average_latency_ms" integer DEFAULT 0,
	"success_rate" real DEFAULT 100,
	"last_health_check" timestamp,
	"total_requests_today" integer DEFAULT 0,
	"total_cost_today_cents" integer DEFAULT 0,
	"daily_budget_cents" integer,
	"priority" integer DEFAULT 1,
	"weight" integer DEFAULT 100,
	"is_enabled" boolean DEFAULT true,
	"is_primary" boolean DEFAULT false,
	"rate_limit_per_minute" integer DEFAULT 60,
	"rate_limit_per_day" integer DEFAULT 10000,
	"current_minute_requests" integer DEFAULT 0,
	"last_minute_reset" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "infera_ai_providers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "infera_anomaly_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_type" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"target_type" text NOT NULL,
	"target_id" varchar,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text,
	"description_ar" text,
	"detected_value" real,
	"expected_value" real,
	"deviation_percent" real,
	"context" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"auto_actions_taken" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_api_keys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"user_id" varchar,
	"organization_id" varchar,
	"allowed_model_ids" jsonb DEFAULT '[]'::jsonb,
	"allowed_functional_roles" jsonb DEFAULT '[]'::jsonb,
	"permissions" jsonb DEFAULT '{"chat":true,"completions":true}'::jsonb,
	"rate_limit_per_minute" integer DEFAULT 60,
	"rate_limit_per_hour" integer DEFAULT 1000,
	"rate_limit_per_day" integer DEFAULT 10000,
	"max_tokens_per_request" integer DEFAULT 4096,
	"max_requests_per_month" integer,
	"max_tokens_per_month" integer,
	"monthly_budget_cents" integer,
	"current_month_spend_cents" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"last_used_ip" text,
	"total_requests" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"total_cost_cents" integer DEFAULT 0,
	"allowed_ips" jsonb DEFAULT '[]'::jsonb,
	"allowed_domains" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_by" varchar,
	"revoked_by" varchar,
	"revoked_at" timestamp,
	"revocation_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_api_usage_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" varchar,
	"model_id" varchar,
	"endpoint" text NOT NULL,
	"method" text DEFAULT 'POST' NOT NULL,
	"request_id" text,
	"prompt_tokens" integer DEFAULT 0,
	"completion_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"cost_cents" integer DEFAULT 0,
	"latency_ms" integer,
	"ttfb_ms" integer,
	"status_code" integer,
	"error_code" text,
	"error_message" text,
	"client_ip" text,
	"user_agent" text,
	"actual_backend_model" text,
	"routing_decision" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_client_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"organization_id" varchar,
	"api_key_id" varchar,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"plan_display_name" text,
	"plan_display_name_ar" text,
	"monthly_request_limit" integer DEFAULT 1000,
	"monthly_token_limit" integer DEFAULT 100000,
	"monthly_budget_cents" integer DEFAULT 0,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"current_period_requests" integer DEFAULT 0,
	"current_period_tokens" integer DEFAULT 0,
	"current_period_spend_cents" integer DEFAULT 0,
	"features" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"billing_email" text,
	"billing_cycle" text DEFAULT 'monthly',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_client_webhooks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" varchar NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb,
	"filters" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_triggered_at" timestamp,
	"last_success_at" timestamp,
	"last_failure_at" timestamp,
	"consecutive_failures" integer DEFAULT 0,
	"total_deliveries" integer DEFAULT 0,
	"successful_deliveries" integer DEFAULT 0,
	"failed_deliveries" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_compliance_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_type" text NOT NULL,
	"report_period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"findings" jsonb DEFAULT '[]'::jsonb,
	"compliance_checks" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'generated' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"file_url" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "infera_intelligence_models" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"display_name_ar" text,
	"slug" text NOT NULL,
	"description" text,
	"description_ar" text,
	"functional_role" text NOT NULL,
	"custom_role" text,
	"service_level" text DEFAULT 'core' NOT NULL,
	"icon" text,
	"brand_color" text,
	"backend_model_id" varchar,
	"fallback_model_id" varchar,
	"engine_bindings" jsonb DEFAULT '{"primary":"","fallbacks":[]}'::jsonb,
	"system_prompt" text,
	"system_prompt_ar" text,
	"temperature" real DEFAULT 0.7,
	"max_tokens" integer DEFAULT 4096,
	"top_p" real DEFAULT 1,
	"frequency_penalty" real DEFAULT 0,
	"presence_penalty" real DEFAULT 0,
	"capabilities" jsonb DEFAULT '[]'::jsonb,
	"supported_formats" jsonb DEFAULT '["text"]'::jsonb,
	"rate_limit_per_minute" integer DEFAULT 60,
	"rate_limit_per_day" integer DEFAULT 10000,
	"max_context_length" integer DEFAULT 128000,
	"input_cost_per_1k_tokens" integer DEFAULT 0,
	"output_cost_per_1k_tokens" integer DEFAULT 0,
	"allowed_plans" jsonb DEFAULT '[]'::jsonb,
	"allowed_roles" jsonb DEFAULT '[]'::jsonb,
	"requires_api_key" boolean DEFAULT true,
	"is_public" boolean DEFAULT false,
	"status" text DEFAULT 'inactive' NOT NULL,
	"status_message" text,
	"sort_order" integer DEFAULT 0,
	"show_in_catalog" boolean DEFAULT true,
	"featured_until" timestamp,
	"total_requests" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"average_latency_ms" integer DEFAULT 0,
	"last_used_at" timestamp,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "infera_intelligence_models_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "infera_model_audit_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar,
	"action" text NOT NULL,
	"action_category" text NOT NULL,
	"previous_value" jsonb DEFAULT '{}'::jsonb,
	"new_value" jsonb DEFAULT '{}'::jsonb,
	"changed_fields" jsonb DEFAULT '[]'::jsonb,
	"performed_by" varchar,
	"performed_by_role" text,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_platforms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"platform_type" text DEFAULT 'commercial' NOT NULL,
	"sovereignty_tier" text DEFAULT 'platform' NOT NULL,
	"category" text DEFAULT 'commercial' NOT NULL,
	"version" varchar(20) DEFAULT '1.0.0',
	"base_url" text,
	"api_endpoint" text,
	"webhook_url" text,
	"health_check_url" text,
	"capabilities" jsonb DEFAULT '{}'::jsonb,
	"service_config" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_system_platform" boolean DEFAULT false NOT NULL,
	"owner_id" varchar,
	"tenant_id" varchar,
	"launched_at" timestamp,
	"last_health_check_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "infera_platforms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "infera_provider_health_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"bucket" text NOT NULL,
	"request_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"timeout_count" integer DEFAULT 0,
	"avg_latency_ms" integer DEFAULT 0,
	"p50_latency_ms" integer DEFAULT 0,
	"p95_latency_ms" integer DEFAULT 0,
	"p99_latency_ms" integer DEFAULT 0,
	"total_input_tokens" integer DEFAULT 0,
	"total_output_tokens" integer DEFAULT 0,
	"total_cost_cents" integer DEFAULT 0,
	"error_breakdown" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_routing_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"rule_type" text NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb,
	"provider_order" jsonb DEFAULT '[]'::jsonb,
	"provider_weights" jsonb DEFAULT '{}'::jsonb,
	"fallback_chain" jsonb DEFAULT '[]'::jsonb,
	"max_retries" integer DEFAULT 2,
	"retry_delay_ms" integer DEFAULT 1000,
	"failover_threshold" integer DEFAULT 3,
	"load_balance_strategy" text DEFAULT 'round_robin',
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 100,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infera_webhook_delivery_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"attempt_number" integer DEFAULT 1,
	"status_code" integer,
	"response_body" text,
	"response_time_ms" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "infrastructure_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"user_email" text,
	"user_role" text NOT NULL,
	"user_ip" text,
	"action" text NOT NULL,
	"action_category" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" varchar,
	"target_name" text,
	"state_before" jsonb,
	"state_after" jsonb,
	"success" boolean NOT NULL,
	"error_message" text,
	"error_code" text,
	"provider_id" varchar,
	"provider_type" text,
	"external_request_id" text,
	"metadata" jsonb,
	"request_duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "infrastructure_backups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"type" text DEFAULT 'snapshot' NOT NULL,
	"size_gb" real DEFAULT 0,
	"status" text DEFAULT 'creating' NOT NULL,
	"is_automatic" boolean DEFAULT false NOT NULL,
	"schedule_type" text,
	"retention_days" integer DEFAULT 30,
	"cost_per_month" real DEFAULT 0,
	"restored_at" timestamp,
	"restored_by" varchar,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_budgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text DEFAULT 'global' NOT NULL,
	"scope_id" varchar,
	"monthly_budget" real NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"alert_at_70" boolean DEFAULT true NOT NULL,
	"alert_at_85" boolean DEFAULT true NOT NULL,
	"alert_at_95" boolean DEFAULT true NOT NULL,
	"alert_at_100" boolean DEFAULT true NOT NULL,
	"auto_stop_at_100" boolean DEFAULT false NOT NULL,
	"auto_scale_down" boolean DEFAULT false NOT NULL,
	"current_spend" real DEFAULT 0,
	"forecasted_spend" real DEFAULT 0,
	"last_updated" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_cost_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_type" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"provider_id" varchar,
	"server_id" varchar,
	"title" text NOT NULL,
	"title_ar" text,
	"message" text NOT NULL,
	"message_ar" text,
	"current_value" real,
	"threshold_value" real,
	"currency" text DEFAULT 'USD',
	"recommendation" text,
	"recommendation_ar" text,
	"potential_savings" real,
	"status" text DEFAULT 'active' NOT NULL,
	"acknowledged_at" timestamp,
	"acknowledged_by" varchar,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_inventory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"provider_id" varchar,
	"external_id" text,
	"resource_type" text NOT NULL,
	"name" text NOT NULL,
	"hostname" text,
	"region" text,
	"datacenter" text,
	"country" text,
	"server_type" text,
	"cpu_cores" integer,
	"memory_gb" integer,
	"disk_gb" integer,
	"disk_type" text,
	"public_ipv4" text,
	"public_ipv6" text,
	"private_ip" text,
	"network_ids" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'provisioning',
	"health_status" text DEFAULT 'unknown',
	"last_health_check" timestamp,
	"os_type" text,
	"os_image" text,
	"installed_software" jsonb DEFAULT '[]'::jsonb,
	"kubernetes_role" text,
	"kubernetes_version" text,
	"docker_version" text,
	"hourly_price_usd" real,
	"monthly_price_usd" real,
	"tags" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"project_id" varchar,
	"owner_id" varchar,
	"provisioned_at" timestamp,
	"terminated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_providers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"display_name_ar" text,
	"description" text,
	"description_ar" text,
	"type" text DEFAULT 'primary' NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"regions" jsonb DEFAULT '[]'::jsonb,
	"server_types" jsonb DEFAULT '[]'::jsonb,
	"credentials_ref" text,
	"api_endpoint" text,
	"connection_status" text DEFAULT 'disconnected' NOT NULL,
	"last_health_check" timestamp,
	"health_score" integer DEFAULT 100,
	"active_servers" integer DEFAULT 0,
	"total_cost_this_month" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_servers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"description" text,
	"server_type" text NOT NULL,
	"region" text NOT NULL,
	"ipv4" text,
	"ipv6" text,
	"cpu" integer NOT NULL,
	"ram" integer NOT NULL,
	"storage" integer NOT NULL,
	"status" text DEFAULT 'provisioning' NOT NULL,
	"power_status" text DEFAULT 'off',
	"os" text DEFAULT 'ubuntu-22.04',
	"os_version" text,
	"purpose" text DEFAULT 'production' NOT NULL,
	"workloads" jsonb DEFAULT '[]'::jsonb,
	"cost_per_hour" real DEFAULT 0,
	"cost_per_month" real DEFAULT 0,
	"total_cost_to_date" real DEFAULT 0,
	"cpu_usage" real DEFAULT 0,
	"ram_usage" real DEFAULT 0,
	"storage_usage" real DEFAULT 0,
	"network_in" real DEFAULT 0,
	"network_out" real DEFAULT 0,
	"last_metrics_at" timestamp,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"last_backup_at" timestamp,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"project_id" varchar,
	"owner_notes" text,
	"labels" jsonb DEFAULT '{}'::jsonb,
	"last_sync_at" timestamp,
	"sync_error" text,
	"sync_status" text DEFAULT 'synced',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "institutional_memory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"organization_id" varchar,
	"node_type" text NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"content" text NOT NULL,
	"content_ar" text,
	"embedding" jsonb,
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"context" text,
	"reasoning" text,
	"alternatives" jsonb DEFAULT '[]'::jsonb,
	"consequences" jsonb DEFAULT '[]'::jsonb,
	"related_memory_ids" jsonb DEFAULT '[]'::jsonb,
	"source_documents" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar,
	"approved_by" varchar,
	"status" text DEFAULT 'active',
	"superseded_by" varchar,
	"importance" text DEFAULT 'medium',
	"confidentiality" text DEFAULT 'internal',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integration_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar,
	"api_key_id" varchar,
	"user_id" varchar,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"previous_value" jsonb,
	"new_value" jsonb,
	"ip_address" text,
	"user_agent" text,
	"is_success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integration_credentials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_type" text NOT NULL,
	"provider" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"credential_type" text NOT NULL,
	"encrypted_data" text NOT NULL,
	"encryption_key_id" text,
	"scope" text DEFAULT 'project',
	"project_id" varchar,
	"organization_id" varchar,
	"owner_id" varchar,
	"allowed_users" jsonb DEFAULT '[]'::jsonb,
	"allowed_roles" jsonb DEFAULT '[]'::jsonb,
	"is_valid" boolean DEFAULT true,
	"last_validated_at" timestamp,
	"validation_error" text,
	"expires_at" timestamp,
	"rotated_at" timestamp,
	"rotation_policy" text,
	"last_used_at" timestamp,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"number" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"payment_method" text,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "legal_clauses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clause_code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"category" text NOT NULL,
	"content_en" text NOT NULL,
	"content_ar" text NOT NULL,
	"applicable_contract_types" jsonb,
	"is_mandatory" boolean DEFAULT false NOT NULL,
	"variables" jsonb,
	"severity" text DEFAULT 'standard',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "legal_clauses_clause_code_unique" UNIQUE("clause_code")
);
--> statement-breakpoint
CREATE TABLE "license_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" varchar NOT NULL,
	"action" text NOT NULL,
	"previous_status" text,
	"new_status" text,
	"performed_by" varchar,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "login_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"ip_address" text,
	"country" text,
	"country_code" text,
	"city" text,
	"region" text,
	"timezone" text,
	"isp" text,
	"device_type" text,
	"browser" text,
	"browser_version" text,
	"os" text,
	"os_version" text,
	"user_agent" text,
	"login_at" timestamp DEFAULT now(),
	"logout_at" timestamp,
	"last_activity_at" timestamp DEFAULT now(),
	"activities" jsonb DEFAULT '[]'::jsonb,
	"login_notification_sent" boolean DEFAULT false,
	"logout_notification_sent" boolean DEFAULT false,
	"auth_method" text DEFAULT 'password',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "margin_guard_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"minimum_margin_percent" real DEFAULT 20 NOT NULL,
	"warning_threshold_percent" real DEFAULT 25 NOT NULL,
	"critical_threshold_percent" real DEFAULT 15 NOT NULL,
	"auto_suspend_on_negative_margin" boolean DEFAULT false NOT NULL,
	"auto_notify_on_warning" boolean DEFAULT true NOT NULL,
	"notification_channels" jsonb DEFAULT '["email","dashboard"]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"type" text DEFAULT 'email' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"audience" integer DEFAULT 0 NOT NULL,
	"reached" integer DEFAULT 0 NOT NULL,
	"clicked" integer DEFAULT 0 NOT NULL,
	"converted" integer DEFAULT 0 NOT NULL,
	"budget" integer DEFAULT 0 NOT NULL,
	"spent" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_installations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"item_id" varchar NOT NULL,
	"platform_id" varchar,
	"installed_version" text DEFAULT '1.0.0',
	"rating" integer,
	"review" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"installed_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text NOT NULL,
	"description_ar" text,
	"author" text NOT NULL,
	"author_id" varchar,
	"type" text DEFAULT 'template' NOT NULL,
	"category" text NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"price" integer DEFAULT 0,
	"downloads" integer DEFAULT 0 NOT NULL,
	"rating" real DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"icon" text DEFAULT 'package',
	"preview_image" text,
	"source_url" text,
	"version" text DEFAULT '1.0.0',
	"features" jsonb DEFAULT '[]'::jsonb,
	"features_ar" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"user_id" varchar,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metrics_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"deployment_id" varchar,
	"response_time_avg" real,
	"response_time_p95" real,
	"response_time_p99" real,
	"error_rate" real,
	"success_rate" real,
	"requests_per_minute" integer,
	"cpu_usage" real,
	"memory_usage" real,
	"disk_usage" real,
	"network_in" integer,
	"network_out" integer,
	"is_healthy" boolean DEFAULT true NOT NULL,
	"active_instances" integer DEFAULT 1,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_usage_summary" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"total_requests" integer DEFAULT 0 NOT NULL,
	"total_ai_tokens" integer DEFAULT 0 NOT NULL,
	"total_api_requests" integer DEFAULT 0 NOT NULL,
	"total_storage_mb" real DEFAULT 0 NOT NULL,
	"real_cost_usd" real DEFAULT 0 NOT NULL,
	"billed_cost_usd" real DEFAULT 0 NOT NULL,
	"margin_usd" real DEFAULT 0 NOT NULL,
	"margin_percent" real DEFAULT 0 NOT NULL,
	"ai_cost_usd" real DEFAULT 0 NOT NULL,
	"api_cost_usd" real DEFAULT 0 NOT NULL,
	"storage_cost_usd" real DEFAULT 0 NOT NULL,
	"other_cost_usd" real DEFAULT 0 NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"invoice_id" varchar,
	"country_code" text,
	"currency" text DEFAULT 'USD',
	"exchange_rate" real DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "namecheap_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar NOT NULL,
	"contact_type" text DEFAULT 'registrant' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"organization" text,
	"job_title" text,
	"address1" text NOT NULL,
	"address2" text,
	"city" text NOT NULL,
	"state_province" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"phone" text NOT NULL,
	"fax" text,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "namecheap_dns_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" varchar NOT NULL,
	"host_name" text NOT NULL,
	"record_type" text NOT NULL,
	"address" text NOT NULL,
	"mx_pref" integer,
	"ttl" integer DEFAULT 1800 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "namecheap_domains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"namecheap_id" text,
	"domain_name" text NOT NULL,
	"sld" text NOT NULL,
	"tld" text NOT NULL,
	"owner_id" varchar,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"is_auto_renew" boolean DEFAULT true NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"whois_guard" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"registered_at" timestamp,
	"nameservers" jsonb DEFAULT '[]'::jsonb,
	"use_custom_nameservers" boolean DEFAULT false NOT NULL,
	"registration_price" real,
	"renewal_price" real,
	"currency" text DEFAULT 'USD',
	"last_sync_at" timestamp,
	"sync_error" text,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "namecheap_domains_domain_name_unique" UNIQUE("domain_name")
);
--> statement-breakpoint
CREATE TABLE "namecheap_operation_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" varchar,
	"domain_name" text NOT NULL,
	"user_id" varchar,
	"user_email" text,
	"operation" text NOT NULL,
	"operation_details" jsonb,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "navigation_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" varchar,
	"path" text NOT NULL,
	"total_visits" integer DEFAULT 0,
	"unique_visitors" integer DEFAULT 0,
	"search_appearances" integer DEFAULT 0,
	"search_clicks" integer DEFAULT 0,
	"date" text NOT NULL,
	"by_role" jsonb DEFAULT '{}'::jsonb,
	"avg_time_on_page" real,
	"bounce_rate" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_resources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"path" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text,
	"description_ar" text,
	"keywords_en" text,
	"keywords_ar" text,
	"category" text NOT NULL,
	"section" text,
	"icon" text,
	"required_role" text DEFAULT 'owner',
	"required_permissions" jsonb DEFAULT '[]'::jsonb,
	"priority" integer DEFAULT 50,
	"is_quick_action" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_system_resource" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "navigation_resources_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "navigation_search_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"query" text NOT NULL,
	"language" text DEFAULT 'en',
	"result_count" integer DEFAULT 0,
	"selected_resource_id" varchar,
	"selected_path" text,
	"response_time_ms" integer,
	"source_page" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_shortcuts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label_en" text NOT NULL,
	"label_ar" text NOT NULL,
	"resource_id" varchar,
	"target_path" text,
	"action_type" text DEFAULT 'navigate',
	"action_data" jsonb DEFAULT '{}'::jsonb,
	"keyboard_shortcut" text,
	"icon" text,
	"category" text DEFAULT 'general',
	"priority" integer DEFAULT 50,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_global" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "navigation_shortcuts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "navigation_user_state" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"favorite_resource_ids" jsonb DEFAULT '[]'::jsonb,
	"recent_resource_ids" jsonb DEFAULT '[]'::jsonb,
	"personal_shortcuts" jsonb DEFAULT '[]'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"last_accessed_path" text,
	"last_accessed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_type" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_sent" integer DEFAULT 0,
	"total_delivered" integer DEFAULT 0,
	"total_read" integer DEFAULT 0,
	"total_acknowledged" integer DEFAULT 0,
	"total_failed" integer DEFAULT 0,
	"total_escalated" integer DEFAULT 0,
	"avg_delivery_time_ms" integer DEFAULT 0,
	"avg_read_time_minutes" integer DEFAULT 0,
	"avg_acknowledge_time_minutes" integer DEFAULT 0,
	"by_type" jsonb DEFAULT '{}'::jsonb,
	"by_priority" jsonb DEFAULT '{}'::jsonb,
	"by_channel" jsonb DEFAULT '{}'::jsonb,
	"delivery_rate" real DEFAULT 0,
	"read_rate" real DEFAULT 0,
	"acknowledgment_rate" real DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_escalations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" varchar NOT NULL,
	"escalation_level" integer NOT NULL,
	"previous_channel" text,
	"new_channel" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"response_received_at" timestamp,
	"auto_action_triggered" boolean DEFAULT false NOT NULL,
	"auto_action_details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"type" text NOT NULL,
	"event_trigger" text NOT NULL,
	"title_template" text NOT NULL,
	"title_template_ar" text,
	"message_template" text NOT NULL,
	"message_template_ar" text,
	"default_priority" text DEFAULT 'MEDIUM' NOT NULL,
	"default_channels" jsonb DEFAULT '["DASHBOARD"]'::jsonb,
	"requires_acknowledgment" boolean DEFAULT false NOT NULL,
	"escalation_rules" jsonb DEFAULT '[]'::jsonb,
	"auto_action_config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"message" text NOT NULL,
	"message_ar" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"link" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nova_approval_chains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"levels" jsonb NOT NULL,
	"decision_types" jsonb,
	"risk_levels" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_decision_audit" (
	"id" varchar PRIMARY KEY NOT NULL,
	"decision_id" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"phase" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_name" text NOT NULL,
	"action" text NOT NULL,
	"action_ar" text NOT NULL,
	"reason" text NOT NULL,
	"reason_ar" text NOT NULL,
	"inputs" jsonb,
	"outputs" jsonb,
	"policy_references" jsonb,
	"signature" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_decision_steps" (
	"id" varchar PRIMARY KEY NOT NULL,
	"decision_id" varchar NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"description" text NOT NULL,
	"description_ar" text NOT NULL,
	"order" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"approval_level" text DEFAULT 'standard' NOT NULL,
	"estimated_impact" text,
	"rollback_plan" text,
	"executed_at" timestamp,
	"execution_result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_decisions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" varchar,
	"message_id" varchar,
	"category" text NOT NULL,
	"decision_type" text NOT NULL,
	"question" text NOT NULL,
	"selected_option" text NOT NULL,
	"alternatives" jsonb,
	"context" jsonb,
	"reasoning" text,
	"user_notes" text,
	"status" text DEFAULT 'active' NOT NULL,
	"superseded_by" varchar,
	"was_applied" boolean DEFAULT false NOT NULL,
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_human_in_loop" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_category" text NOT NULL,
	"decision_type" text NOT NULL,
	"risk_threshold" text NOT NULL,
	"cost_threshold" integer,
	"impact_scope" text,
	"required_approver" text NOT NULL,
	"escalation_path" jsonb,
	"legal_review" boolean DEFAULT false NOT NULL,
	"ethical_review" boolean DEFAULT false NOT NULL,
	"compliance_check" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_kill_switch" (
	"id" varchar PRIMARY KEY NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"activated_by" text NOT NULL,
	"activated_at" timestamp DEFAULT now() NOT NULL,
	"reason" text NOT NULL,
	"deactivated_by" text,
	"deactivated_at" timestamp,
	"scope" text DEFAULT 'global' NOT NULL,
	"affected_models" jsonb
);
--> statement-breakpoint
CREATE TABLE "nova_knowledge_graph" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_type" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"properties" jsonb,
	"relations" jsonb,
	"semantic_vector" jsonb,
	"keywords" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"language" text DEFAULT 'ar' NOT NULL,
	"attachments" jsonb,
	"model_used" text,
	"tokens_used" integer,
	"response_time" integer,
	"actions" jsonb,
	"is_edited" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_model_lifecycle" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar NOT NULL,
	"stage" text NOT NULL,
	"previous_stage" text,
	"transitioned_by" text NOT NULL,
	"transition_reason" text,
	"risk_score" integer DEFAULT 0,
	"bias_score" integer DEFAULT 0,
	"drift_score" integer DEFAULT 0,
	"performance_metrics" jsonb,
	"approved_by" text,
	"approved_at" timestamp,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_permission_audit" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"actor_id" varchar NOT NULL,
	"action" text NOT NULL,
	"permission_code" text,
	"permission_codes" jsonb,
	"previous_state" boolean,
	"new_state" boolean,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_permission_grants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"permission_code" text NOT NULL,
	"is_granted" boolean DEFAULT false NOT NULL,
	"granted_by" varchar,
	"granted_at" timestamp,
	"revoked_by" varchar,
	"revoked_at" timestamp,
	"expires_at" timestamp,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_permission_presets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text,
	"description_ar" text,
	"permissions" jsonb NOT NULL,
	"color" text,
	"icon" text,
	"display_order" integer DEFAULT 0,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nova_permission_presets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "nova_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text,
	"description_ar" text,
	"category" text NOT NULL,
	"security_level" text NOT NULL,
	"default_enabled" boolean DEFAULT false NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nova_permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "nova_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text NOT NULL,
	"description_ar" text NOT NULL,
	"type" text NOT NULL,
	"scope" text NOT NULL,
	"constraints" jsonb,
	"priority" integer DEFAULT 50 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_policy_memory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memory_type" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"source" text NOT NULL,
	"source_id" text,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"version" integer DEFAULT 1 NOT NULL,
	"previous_version" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nova_policy_memory_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "nova_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"preferred_language" text DEFAULT 'ar',
	"preferred_framework" text,
	"preferred_database" text,
	"preferred_cloud_provider" text,
	"preferred_ui_style" text,
	"detail_level" text DEFAULT 'balanced',
	"code_explanations" boolean DEFAULT true,
	"show_alternatives" boolean DEFAULT true,
	"architecture_patterns" jsonb,
	"default_configs" jsonb,
	"interaction_count" integer DEFAULT 0,
	"last_interaction" timestamp,
	"learning_score" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nova_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "nova_project_contexts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"project_type" text,
	"tech_stack" jsonb,
	"active_blueprint" jsonb,
	"generated_models" jsonb,
	"generated_services" jsonb,
	"config_history" jsonb,
	"detected_conflicts" jsonb,
	"estimated_costs" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nova_project_contexts_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "nova_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"title" text,
	"summary" text,
	"language" text DEFAULT 'ar' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"context_snapshot" jsonb,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nova_sovereign_decisions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"description" text NOT NULL,
	"description_ar" text NOT NULL,
	"target_platform" text,
	"target_resource" text,
	"requested_by" text NOT NULL,
	"phase" text DEFAULT 'analysis' NOT NULL,
	"risk_level" text DEFAULT 'medium' NOT NULL,
	"required_approval_level" text DEFAULT 'standard' NOT NULL,
	"feasibility_score" integer DEFAULT 0,
	"analysis_result" jsonb,
	"context" jsonb,
	"urgency" text DEFAULT 'normal' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"approval_notes" text,
	"rejected_by" text,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"executed_at" timestamp,
	"execution_result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email" text NOT NULL,
	"code" varchar(6) NOT NULL,
	"type" text DEFAULT 'email' NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "otp_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"type" text DEFAULT 'email' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owner_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"platform_name" text DEFAULT 'INFERA WebNova' NOT NULL,
	"platform_name_ar" text DEFAULT 'إنفيرا ويب نوفا' NOT NULL,
	"primary_domain" text,
	"support_email" text,
	"default_language" text DEFAULT 'ar' NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"registration_enabled" boolean DEFAULT true NOT NULL,
	"global_announcement" text,
	"global_announcement_ar" text,
	"analytics_enabled" boolean DEFAULT true NOT NULL,
	"ai_assistants_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "owner_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ownership_transfers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_owner_id" varchar NOT NULL,
	"to_owner_id" varchar,
	"transfer_type" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"legal_document_ref" text,
	"notary_ref" text,
	"valuation_usd" real,
	"from_owner_signature" text,
	"to_owner_signature" text,
	"witness_signatures" jsonb DEFAULT '[]'::jsonb,
	"initiated_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"reason" text,
	"reason_ar" text,
	"checksum" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_api_calls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"endpoint" text NOT NULL,
	"method" text DEFAULT 'GET' NOT NULL,
	"service_name" text,
	"service_name_ar" text,
	"service_type" text,
	"call_count" integer DEFAULT 0,
	"avg_response_time" real,
	"success_rate" real,
	"last_called_at" timestamp,
	"last_status" integer,
	"error_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_components" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"component_name" text NOT NULL,
	"component_name_ar" text,
	"component_type" text NOT NULL,
	"mount_count" integer DEFAULT 0,
	"avg_render_time" real,
	"last_mounted_at" timestamp,
	"is_active" boolean DEFAULT true,
	"has_ai" boolean DEFAULT false,
	"has_automation" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_service_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"date" text NOT NULL,
	"overall_score" real DEFAULT 0,
	"performance_score" real DEFAULT 0,
	"security_score" real DEFAULT 0,
	"ai_score" real DEFAULT 0,
	"automation_score" real DEFAULT 0,
	"total_components" integer DEFAULT 0,
	"ai_components" integer DEFAULT 0,
	"automation_components" integer DEFAULT 0,
	"total_api_calls" integer DEFAULT 0,
	"avg_load_time" real,
	"avg_api_response_time" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"icon" text,
	"public_key" text,
	"secret_key_ref" text,
	"webhook_secret" text,
	"sandbox_mode" boolean DEFAULT true NOT NULL,
	"supported_currencies" jsonb DEFAULT '["USD","SAR","AED"]'::jsonb NOT NULL,
	"min_amount" integer DEFAULT 100 NOT NULL,
	"max_amount" integer DEFAULT 1000000 NOT NULL,
	"transaction_fee" integer DEFAULT 0 NOT NULL,
	"fixed_fee" integer DEFAULT 0 NOT NULL,
	"supported_countries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_configured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_retry_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar NOT NULL,
	"original_payment_id" varchar,
	"stripe_invoice_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"max_attempts" integer DEFAULT 4 NOT NULL,
	"next_retry_at" timestamp NOT NULL,
	"last_attempt_at" timestamp,
	"last_failure_reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"grace_period_end" timestamp,
	"notifications_sent" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"payment_method_id" varchar NOT NULL,
	"subscription_id" varchar,
	"provider" text NOT NULL,
	"provider_transaction_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"net_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"failure_code" text,
	"customer_email" text,
	"customer_name" text,
	"billing_cycle" text,
	"plan_name" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"processed_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text NOT NULL,
	"stripe_payment_intent_id" text,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permission_overrides" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"permission_code" text NOT NULL,
	"type" text NOT NULL,
	"granted_by" varchar NOT NULL,
	"reason" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plan_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" varchar NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" varchar,
	"user_id" varchar,
	"serial_number" varchar(100) NOT NULL,
	"common_name" text NOT NULL,
	"hierarchy_role" text DEFAULT 'user_cert' NOT NULL,
	"parent_cert_id" varchar,
	"public_key_fingerprint" text NOT NULL,
	"signature_algorithm" varchar(50) DEFAULT 'SHA256withRSA',
	"key_size" integer DEFAULT 2048,
	"scope" jsonb DEFAULT '{}'::jsonb,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp,
	"revoked_reason" text,
	"is_hardware_backed" boolean DEFAULT false NOT NULL,
	"is_owner_certificate" boolean DEFAULT false NOT NULL,
	"can_sign_others" boolean DEFAULT false NOT NULL,
	"rotation_policy" jsonb,
	"issued_by" varchar,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_certificates_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "platform_icon_versions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_icon_id" varchar NOT NULL,
	"platform_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"version_label" text,
	"icon_files" jsonb NOT NULL,
	"primary_icon_path" text NOT NULL,
	"generation_prompt" text,
	"generation_status" text DEFAULT 'completed' NOT NULL,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"restored_from" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_icons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"category" text NOT NULL,
	"colors" jsonb NOT NULL,
	"symbol" jsonb NOT NULL,
	"symbol_ar" jsonb NOT NULL,
	"meaning" text NOT NULL,
	"meaning_ar" text NOT NULL,
	"current_version_id" varchar,
	"current_icon_path" text,
	"icon_archive_path" text NOT NULL,
	"usage_contexts" jsonb DEFAULT '[]'::jsonb,
	"usage_rules" jsonb,
	"total_versions" integer DEFAULT 0 NOT NULL,
	"total_regenerations" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_icons_platform_id_unique" UNIQUE("platform_id")
);
--> statement-breakpoint
CREATE TABLE "platform_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_platform_id" varchar NOT NULL,
	"target_platform_id" varchar NOT NULL,
	"link_type" text DEFAULT 'peer' NOT NULL,
	"link_direction" text DEFAULT 'bidirectional' NOT NULL,
	"trust_level" integer DEFAULT 5 NOT NULL,
	"sync_policies" jsonb DEFAULT '{}'::jsonb,
	"allowed_operations" jsonb DEFAULT '[]'::jsonb,
	"restricted_operations" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"established_at" timestamp,
	"last_sync_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"active_users" integer DEFAULT 0 NOT NULL,
	"new_users" integer DEFAULT 0 NOT NULL,
	"churned_users" integer DEFAULT 0 NOT NULL,
	"users_by_plan" jsonb DEFAULT '{}'::jsonb,
	"new_subscriptions" integer DEFAULT 0 NOT NULL,
	"cancelled_subscriptions" integer DEFAULT 0 NOT NULL,
	"upgrades" integer DEFAULT 0 NOT NULL,
	"downgrades" integer DEFAULT 0 NOT NULL,
	"daily_revenue" integer DEFAULT 0 NOT NULL,
	"mrr" integer DEFAULT 0 NOT NULL,
	"arr" integer DEFAULT 0 NOT NULL,
	"ai_requests" integer DEFAULT 0 NOT NULL,
	"ai_tokens_used" integer DEFAULT 0 NOT NULL,
	"ai_cost" integer DEFAULT 0 NOT NULL,
	"total_projects" integer DEFAULT 0 NOT NULL,
	"new_projects" integer DEFAULT 0 NOT NULL,
	"published_projects" integer DEFAULT 0 NOT NULL,
	"page_views" integer DEFAULT 0 NOT NULL,
	"api_calls" integer DEFAULT 0 NOT NULL,
	"error_rate" integer DEFAULT 0 NOT NULL,
	"avg_response_time" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_ownership_transfers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownership_id" varchar NOT NULL,
	"from_owner_id" varchar NOT NULL,
	"to_owner_id" varchar NOT NULL,
	"transfer_type" text NOT NULL,
	"sale_price" real,
	"currency" text DEFAULT 'SAR',
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"contract_id" varchar,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"rejection_reason" text,
	"documents" jsonb,
	"initiated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_ownerships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"ownership_type" text DEFAULT 'full' NOT NULL,
	"ownership_percentage" real DEFAULT 100,
	"registration_number" text,
	"registered_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	"legal_entity_name" text,
	"legal_entity_type" text,
	"tax_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_ownerships_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "platform_services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" varchar NOT NULL,
	"service_name" text NOT NULL,
	"service_name_ar" text,
	"service_kind" text NOT NULL,
	"service_contract" jsonb,
	"lifecycle_hooks" jsonb,
	"maintenance_schedule" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"last_service_at" timestamp,
	"next_service_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"value_type" text DEFAULT 'string' NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"is_system_locked" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" varchar,
	"token_hash" text NOT NULL,
	"token_type" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp,
	"revoked_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"slug" text NOT NULL,
	"description" text,
	"description_ar" text,
	"platform_type" text DEFAULT 'app' NOT NULL,
	"owner_id" varchar,
	"status" text DEFAULT 'active' NOT NULL,
	"primary_url" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platforms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_mortem_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emergency_control_id" varchar,
	"incident_title" text NOT NULL,
	"incident_title_ar" text,
	"incident_severity" text NOT NULL,
	"incident_started_at" timestamp NOT NULL,
	"incident_resolved_at" timestamp,
	"total_downtime_minutes" integer,
	"root_cause" text NOT NULL,
	"root_cause_ar" text,
	"impact_summary" text NOT NULL,
	"impact_summary_ar" text,
	"actions_taken" jsonb DEFAULT '[]'::jsonb,
	"lessons_learned" jsonb DEFAULT '[]'::jsonb,
	"lessons_learned_ar" jsonb DEFAULT '[]'::jsonb,
	"follow_up_actions" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"owner_signature" text,
	"signed_at" timestamp,
	"author_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"provider" text NOT NULL,
	"service" text,
	"base_cost_usd" real NOT NULL,
	"markup_factor" real DEFAULT 1.5 NOT NULL,
	"pricing_model" text DEFAULT 'MARKUP' NOT NULL,
	"region_pricing" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_auth_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"auth_type" text DEFAULT 'jwt' NOT NULL,
	"user_roles" jsonb DEFAULT '[{"name":"admin","nameAr":"مدير","permissions":["*"],"isDefault":false},{"name":"user","nameAr":"مستخدم","permissions":["read","write"],"isDefault":true},{"name":"guest","nameAr":"زائر","permissions":["read"],"isDefault":false}]'::jsonb,
	"features" jsonb DEFAULT '{"registration":true,"login":true,"logout":true,"passwordReset":true,"emailVerification":false,"twoFactorAuth":false,"socialLogin":false,"profileManagement":true}'::jsonb,
	"generated_code" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_backends" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"framework" text DEFAULT 'express' NOT NULL,
	"language" text DEFAULT 'typescript' NOT NULL,
	"api_style" text DEFAULT 'rest' NOT NULL,
	"generated_code" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"generation_progress" integer DEFAULT 0,
	"features" jsonb DEFAULT '{"authentication":true,"crud":true,"validation":true,"rateLimiting":true,"errorHandling":true,"logging":true,"fileUpload":false,"email":false}'::jsonb,
	"deployment_config" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_brain" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"stack" jsonb DEFAULT '{}'::jsonb,
	"status" jsonb DEFAULT '{"overall":"unknown"}'::jsonb,
	"risks" jsonb DEFAULT '{}'::jsonb,
	"next_steps" jsonb DEFAULT '[]'::jsonb,
	"insights" jsonb DEFAULT '{}'::jsonb,
	"last_analyzed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_brain_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "project_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"file" text,
	"line" integer,
	"parent_id" varchar,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_databases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"db_type" text DEFAULT 'postgresql' NOT NULL,
	"orm" text DEFAULT 'drizzle' NOT NULL,
	"schema" jsonb,
	"generated_schema" text,
	"generated_migrations" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_event_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"event_name" text NOT NULL,
	"event_name_ar" text,
	"payload" jsonb NOT NULL,
	"session_id" varchar,
	"message_id" varchar,
	"decision_id" varchar,
	"impact_level" text DEFAULT 'low',
	"affected_components" jsonb DEFAULT '[]'::jsonb,
	"is_reversible" boolean DEFAULT true NOT NULL,
	"rolled_back_at" timestamp,
	"rolled_back_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text NOT NULL,
	"is_directory" boolean DEFAULT false NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"size" integer DEFAULT 0,
	"is_locked" boolean DEFAULT false NOT NULL,
	"last_modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_improvement_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"suggestion_id" varchar,
	"improvement_type" text NOT NULL,
	"change_description" text NOT NULL,
	"change_description_ar" text NOT NULL,
	"file_path" text,
	"code_before" text,
	"code_after" text,
	"score_improvement" integer DEFAULT 0,
	"impact_metrics" jsonb,
	"was_auto_applied" boolean DEFAULT false NOT NULL,
	"can_revert" boolean DEFAULT true NOT NULL,
	"reverted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_knowledge_edges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"source_node_id" varchar NOT NULL,
	"target_node_id" varchar NOT NULL,
	"edge_type" text NOT NULL,
	"label" text,
	"label_ar" text,
	"weight" real DEFAULT 1,
	"reasoning" text,
	"created_by_session" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_knowledge_nodes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"node_type" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"business_intent" text,
	"technical_details" jsonb,
	"embedding" jsonb,
	"created_by_session" varchar,
	"created_by_message" varchar,
	"confidence" real DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL,
	"superseded_by" varchar,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_provisioning_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"job_type" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"result" jsonb,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_versions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"version_number" text NOT NULL,
	"html_code" text NOT NULL,
	"css_code" text NOT NULL,
	"js_code" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"description" text,
	"industry" text,
	"language" text DEFAULT 'ar' NOT NULL,
	"html_code" text DEFAULT '' NOT NULL,
	"css_code" text DEFAULT '' NOT NULL,
	"js_code" text DEFAULT '' NOT NULL,
	"thumbnail" text,
	"custom_domain" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_system_project" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"status" text DEFAULT 'draft',
	"deleted_at" timestamp,
	"is_quarantined" boolean DEFAULT false NOT NULL,
	"quarantine_reason" text,
	"quarantined_at" timestamp,
	"quarantined_by" varchar,
	"content_violations" jsonb DEFAULT '[]'::jsonb,
	"last_content_scan" timestamp,
	"content_score" integer DEFAULT 100,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar,
	"type" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"message" text NOT NULL,
	"message_ar" text,
	"threshold" real,
	"current_value" real,
	"is_acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_api_keys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"encrypted_key" text NOT NULL,
	"key_prefix" text,
	"environment" text DEFAULT 'production' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"last_rotated_at" timestamp,
	"rotation_days" integer DEFAULT 90,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"ip_whitelist" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_credentials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"credential_type" text DEFAULT 'api_token' NOT NULL,
	"encrypted_token" text NOT NULL,
	"token_iv" text NOT NULL,
	"token_auth_tag" text,
	"token_salt" text,
	"last_four_chars" text,
	"token_hash" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"last_verified_at" timestamp,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_error_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"provider_type" text NOT NULL,
	"error_type" text NOT NULL,
	"error_code" text,
	"error_message" text NOT NULL,
	"http_status" integer,
	"endpoint" text,
	"method" text,
	"request_payload" jsonb,
	"response_body" jsonb,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"slug" text NOT NULL,
	"description" text,
	"description_ar" text,
	"type" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"cost_per_unit" integer DEFAULT 0,
	"unit_type" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"service_id" varchar,
	"api_key_id" varchar,
	"user_id" varchar,
	"request_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"total_cost" integer DEFAULT 0 NOT NULL,
	"avg_response_time" integer,
	"date" timestamp NOT NULL,
	"hour" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "query_store" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projection_name" text NOT NULL,
	"projection_id" varchar NOT NULL,
	"tenant_id" varchar,
	"data" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"last_event_sequence" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rate_limit_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"tier" text NOT NULL,
	"requests_per_minute" integer DEFAULT 60 NOT NULL,
	"requests_per_hour" integer DEFAULT 1000 NOT NULL,
	"requests_per_day" integer DEFAULT 10000 NOT NULL,
	"burst_limit" integer DEFAULT 10 NOT NULL,
	"burst_window_seconds" integer DEFAULT 1 NOT NULL,
	"warning_threshold" real DEFAULT 0.8 NOT NULL,
	"block_duration_minutes" integer DEFAULT 15 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rate_limit_policies_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "recycle_bin" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deleted_item_id" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"entity_type" text NOT NULL,
	"entity_name" text NOT NULL,
	"moved_to_recycle_at" timestamp DEFAULT now(),
	"scheduled_purge_at" timestamp,
	"priority" text DEFAULT 'normal' NOT NULL,
	"is_protected" boolean DEFAULT false NOT NULL,
	"protection_reason" text,
	"estimated_recovery_time" integer,
	"dependencies_count" integer DEFAULT 0,
	"tags" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"reason" text NOT NULL,
	"reason_details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"stripe_refund_id" text,
	"processed_at" timestamp,
	"processed_by" varchar,
	"failure_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "remediation_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"finding_id" varchar NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assigned_to" varchar,
	"approved_by" varchar,
	"due_date" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"estimated_hours" integer,
	"actual_hours" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resource_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"platform_id" varchar,
	"resource_type" text NOT NULL,
	"provider" text NOT NULL,
	"service" text NOT NULL,
	"quantity" real DEFAULT 0 NOT NULL,
	"unit_cost_usd" real DEFAULT 0 NOT NULL,
	"real_cost_usd" real DEFAULT 0 NOT NULL,
	"billed_cost_usd" real DEFAULT 0 NOT NULL,
	"pricing_model" text DEFAULT 'FREE' NOT NULL,
	"markup_factor" real DEFAULT 1,
	"request_id" varchar,
	"is_success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"country_code" text,
	"ip_address" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restore_points" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"type" text NOT NULL,
	"trigger_event" text,
	"files_snapshot" jsonb,
	"context_snapshot" jsonb,
	"config_snapshot" jsonb,
	"git_snapshot" jsonb,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"is_immutable" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_findings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"category" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"impact_score" integer DEFAULT 50 NOT NULL,
	"likelihood" integer DEFAULT 50 NOT NULL,
	"risk_score" integer DEFAULT 50 NOT NULL,
	"evidence" text,
	"affected_assets" text[],
	"remediation" text,
	"remediation_ar" text,
	"assigned_to" varchar,
	"due_date" timestamp,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"detected_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "runtime_instances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar,
	"status" text DEFAULT 'stopped' NOT NULL,
	"port" integer,
	"pid" integer,
	"cpu_limit" integer DEFAULT 50,
	"memory_limit" integer DEFAULT 256,
	"network_enabled" boolean DEFAULT true NOT NULL,
	"last_output" text,
	"last_error" text,
	"started_at" timestamp,
	"stopped_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "secrets_vault_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"encrypted_value" text NOT NULL,
	"encryption_method" text DEFAULT 'aes-256-gcm',
	"encryption_key_id" text,
	"scope" text DEFAULT 'project',
	"project_id" varchar,
	"environment" text,
	"secret_type" text DEFAULT 'generic',
	"description" text,
	"tags" jsonb DEFAULT '{}'::jsonb,
	"owner_id" varchar,
	"allowed_services" jsonb DEFAULT '[]'::jsonb,
	"allowed_roles" jsonb DEFAULT '[]'::jsonb,
	"rotation_policy" text,
	"last_rotated_at" timestamp,
	"next_rotation_at" timestamp,
	"rotation_enabled" boolean DEFAULT false,
	"version" integer DEFAULT 1,
	"previous_versions" jsonb DEFAULT '[]'::jsonb,
	"access_count" integer DEFAULT 0,
	"last_accessed_at" timestamp,
	"last_accessed_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_type" text NOT NULL,
	"severity" text NOT NULL,
	"source_ip" text,
	"source_device" text,
	"source_user_id" varchar,
	"target_resource" text NOT NULL,
	"target_resource_id" varchar,
	"description" text NOT NULL,
	"description_ar" text,
	"evidence" jsonb,
	"auto_response_taken" jsonb DEFAULT '[]'::jsonb,
	"manual_response_required" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution" text,
	"post_mortem_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_providers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"description_ar" text,
	"logo" text,
	"website" text,
	"docs_url" text,
	"status" text DEFAULT 'inactive' NOT NULL,
	"is_built_in" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"health_score" real DEFAULT 100,
	"last_health_check" timestamp,
	"avg_response_time" integer,
	"success_rate" real DEFAULT 100,
	"total_requests" integer DEFAULT 0 NOT NULL,
	"total_errors" integer DEFAULT 0 NOT NULL,
	"total_cost" integer DEFAULT 0 NOT NULL,
	"monthly_budget" integer,
	"monthly_spent" integer DEFAULT 0 NOT NULL,
	"rate_limit_per_minute" integer,
	"rate_limit_per_day" integer,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "service_providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"share_code" varchar NOT NULL,
	"is_active" text DEFAULT 'true' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "share_links_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
CREATE TABLE "sidebar_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_key" text NOT NULL,
	"section_key" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text,
	"description_ar" text,
	"icon" text NOT NULL,
	"icon_color" text,
	"path" text NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"visible_to_roles" text[] DEFAULT '{"all"}' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"requires_auth" boolean DEFAULT true NOT NULL,
	"requires_subscription" boolean DEFAULT false NOT NULL,
	"subscription_tier" text,
	"owner_override_visible" boolean,
	"badge" text,
	"badge_variant" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sidebar_pages_page_key_unique" UNIQUE("page_key")
);
--> statement-breakpoint
CREATE TABLE "sidebar_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_key" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text,
	"description_ar" text,
	"icon" text NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"visible_to_roles" text[] DEFAULT '{"all"}' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_collapsible" boolean DEFAULT true NOT NULL,
	"default_expanded" boolean DEFAULT true NOT NULL,
	"owner_override_visible" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sidebar_sections_section_key_unique" UNIQUE("section_key")
);
--> statement-breakpoint
CREATE TABLE "sidebar_user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"collapsed_sections" text[] DEFAULT '{}',
	"pinned_pages" text[] DEFAULT '{}',
	"sidebar_collapsed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sidebar_visibility_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_type" text NOT NULL,
	"target_key" text NOT NULL,
	"action" text NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb,
	"changed_by" varchar NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_suggestions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"description" text NOT NULL,
	"description_ar" text NOT NULL,
	"affected_file" text,
	"affected_code" text,
	"line_number" integer,
	"suggested_fix" text,
	"suggested_fix_ar" text,
	"code_before_fix" text,
	"code_after_fix" text,
	"can_auto_apply" boolean DEFAULT false NOT NULL,
	"auto_apply_script" text,
	"expected_impact" text,
	"expected_impact_ar" text,
	"estimated_effort" text,
	"references" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"applied_at" timestamp,
	"applied_by" varchar,
	"rejected_reason" text,
	"user_rating" integer,
	"user_feedback" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_ai_agents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"layer_id" varchar NOT NULL,
	"description" text,
	"description_ar" text,
	"model" text DEFAULT 'claude-sonnet-4-20250514' NOT NULL,
	"system_prompt" text,
	"temperature" real DEFAULT 0.7 NOT NULL,
	"max_tokens" integer DEFAULT 4096 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"available_to_subscribers" boolean DEFAULT false NOT NULL,
	"requires_sovereign_approval" boolean DEFAULT true NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_action_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"command_id" varchar,
	"action_id" varchar,
	"assistant_id" varchar NOT NULL,
	"actor_id" varchar NOT NULL,
	"actor_type" text DEFAULT 'assistant' NOT NULL,
	"event_type" text NOT NULL,
	"event_description" text NOT NULL,
	"event_description_ar" text,
	"target_entity" text,
	"target_id" varchar,
	"previous_value" jsonb,
	"new_value" jsonb,
	"metadata" jsonb,
	"checksum" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"command_id" varchar NOT NULL,
	"assistant_id" varchar NOT NULL,
	"step_number" integer NOT NULL,
	"action_type" text NOT NULL,
	"target" text NOT NULL,
	"target_id" varchar,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"previous_state" jsonb,
	"new_state" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"result" text,
	"error_message" text,
	"risk_level" text DEFAULT 'low' NOT NULL,
	"is_reversible" boolean DEFAULT true NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_assistants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text NOT NULL,
	"description_ar" text NOT NULL,
	"avatar" text,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"capabilities_ar" jsonb DEFAULT '[]'::jsonb,
	"scope_of_authority" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"system_prompt" text NOT NULL,
	"model" text DEFAULT 'claude-sonnet-4-20250514' NOT NULL,
	"temperature" integer DEFAULT 50 NOT NULL,
	"max_tokens" integer DEFAULT 8000 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_autonomous" boolean DEFAULT false NOT NULL,
	"total_commands_executed" integer DEFAULT 0 NOT NULL,
	"total_actions_executed" integer DEFAULT 0 NOT NULL,
	"success_rate" integer DEFAULT 100 NOT NULL,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_audit_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"platform_id" varchar,
	"category" text NOT NULL,
	"action" text NOT NULL,
	"action_ar" text,
	"target" text,
	"target_path" text,
	"previous_value" jsonb,
	"new_value" jsonb,
	"ai_model" varchar(50),
	"ai_prompt" text,
	"ai_response" text,
	"ai_decision_reason" text,
	"ai_decision_reason_ar" text,
	"ai_alternatives_considered" jsonb,
	"command" text,
	"command_output" text,
	"exit_code" integer,
	"git_operation" text,
	"git_branch" text,
	"git_commit_hash" text,
	"ip_address" text,
	"user_agent" text,
	"session_id" varchar,
	"integrity_hash" text NOT NULL,
	"previous_log_hash" text,
	"is_critical" boolean DEFAULT false NOT NULL,
	"is_reversible" boolean DEFAULT true NOT NULL,
	"was_blocked" boolean DEFAULT false NOT NULL,
	"blocked_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sovereign_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"performed_by" varchar NOT NULL,
	"performer_role" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" varchar,
	"details" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"visible_to_subscribers" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sovereign_commands" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assistant_id" varchar NOT NULL,
	"issued_by" varchar NOT NULL,
	"directive" text NOT NULL,
	"directive_ar" text,
	"category" text DEFAULT 'general' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"interpretation" text,
	"proposed_plan" jsonb,
	"is_simulation" boolean DEFAULT false NOT NULL,
	"simulation_result" jsonb,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"is_approved" boolean DEFAULT false,
	"approved_by" varchar,
	"approved_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"total_steps" integer DEFAULT 0 NOT NULL,
	"result" text,
	"result_ar" text,
	"metrics" jsonb,
	"errors" jsonb DEFAULT '[]'::jsonb,
	"is_reversible" boolean DEFAULT true NOT NULL,
	"rollback_plan" jsonb,
	"rolled_back_at" timestamp,
	"rolled_back_by" varchar,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_compliance_domains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"icon" text NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"standards" jsonb DEFAULT '[]'::jsonb,
	"compliance_score" integer DEFAULT 0 NOT NULL,
	"previous_score" integer,
	"trend" text DEFAULT 'stable' NOT NULL,
	"status" text DEFAULT 'partial' NOT NULL,
	"total_indicators" integer DEFAULT 0 NOT NULL,
	"passed_indicators" integer DEFAULT 0 NOT NULL,
	"failed_indicators" integer DEFAULT 0 NOT NULL,
	"pending_indicators" integer DEFAULT 0 NOT NULL,
	"last_assessed_at" timestamp,
	"next_assessment_due" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sovereign_compliance_domains_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sovereign_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" varchar,
	"platform_id" varchar,
	"title" text NOT NULL,
	"title_ar" text,
	"status" text DEFAULT 'active' NOT NULL,
	"is_encrypted" boolean DEFAULT true NOT NULL,
	"encryption_key_id" varchar,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp,
	"deleted_at" timestamp,
	"deleted_by" varchar,
	"can_restore" boolean DEFAULT true NOT NULL,
	"restore_deadline" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sovereign_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"message" text NOT NULL,
	"message_ar" text,
	"type" text NOT NULL,
	"category" text,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"priority_score" integer DEFAULT 50,
	"context_analysis" jsonb,
	"target_type" text DEFAULT 'user' NOT NULL,
	"target_user_id" varchar,
	"is_owner_only" boolean DEFAULT false NOT NULL,
	"channels" jsonb DEFAULT '["DASHBOARD"]'::jsonb,
	"channel_delivery_status" jsonb DEFAULT '[]'::jsonb,
	"scheduled_for" timestamp,
	"expires_at" timestamp,
	"smart_timing" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"read_at" timestamp,
	"acknowledged_at" timestamp,
	"acknowledged_by" varchar,
	"requires_acknowledgment" boolean DEFAULT false NOT NULL,
	"escalation_level" integer DEFAULT 0,
	"escalation_history" jsonb DEFAULT '[]'::jsonb,
	"auto_action_on_no_response" text,
	"metadata" jsonb,
	"source_system" text,
	"source_event_id" varchar,
	"action_url" text,
	"action_label" text,
	"action_label_ar" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_owner_profile" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"legal_name" text NOT NULL,
	"legal_name_ar" text,
	"national_id" text,
	"passport_number" text,
	"country" text NOT NULL,
	"ownership_state" text DEFAULT 'ACTIVE_OWNER' NOT NULL,
	"ownership_since" timestamp DEFAULT now(),
	"owner_did" text,
	"mfa_enabled" boolean DEFAULT true NOT NULL,
	"hardware_key_required" boolean DEFAULT true NOT NULL,
	"biometric_enabled" boolean DEFAULT false NOT NULL,
	"allowed_ips" jsonb DEFAULT '[]'::jsonb,
	"device_fingerprints" jsonb DEFAULT '[]'::jsonb,
	"single_session_only" boolean DEFAULT true NOT NULL,
	"current_session_id" varchar,
	"last_session_at" timestamp,
	"behavioral_profile" jsonb,
	"daily_cost_limit" real,
	"monthly_cost_limit" real,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sovereign_owner_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sovereign_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_code" text NOT NULL,
	"plan_name" text NOT NULL,
	"plan_name_ar" text,
	"phase" text DEFAULT 'phase_1' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"budget_monthly" real NOT NULL,
	"budget_currency" text DEFAULT 'EUR' NOT NULL,
	"budget_monthly_local" real,
	"local_currency" text DEFAULT 'SAR',
	"server_provider" text DEFAULT 'hetzner' NOT NULL,
	"server_type" text NOT NULL,
	"server_specs" jsonb NOT NULL,
	"ai_config" jsonb,
	"additional_services" jsonb,
	"cost_breakdown" jsonb,
	"scaling_roadmap" jsonb,
	"description" text,
	"description_ar" text,
	"notes" text,
	"approved_by" varchar,
	"approved_at" timestamp,
	"launched_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sovereign_plans_plan_code_unique" UNIQUE("plan_code")
);
--> statement-breakpoint
CREATE TABLE "sovereign_platforms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"type" text NOT NULL,
	"sovereignty_level" text DEFAULT 'MANAGED' NOT NULL,
	"subject_to_subscription" boolean DEFAULT true NOT NULL,
	"default_restrictions" jsonb,
	"evolution_capability" boolean DEFAULT false NOT NULL,
	"cross_platform_linking" boolean DEFAULT false NOT NULL,
	"compliance_requirements" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assistant_type" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"rule_type" text NOT NULL,
	"target" text NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb,
	"value" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"enforcement_level" text DEFAULT 'strict' NOT NULL,
	"violation_action" text DEFAULT 'block' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_policy_compliance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"workspace_id" varchar,
	"policy_version" text NOT NULL,
	"overall_status" text DEFAULT 'pending_review' NOT NULL,
	"compliance_score" integer DEFAULT 0,
	"decision_status" text DEFAULT 'pending' NOT NULL,
	"risk_index" integer DEFAULT 0,
	"evolution_readiness" integer DEFAULT 0,
	"category_scores" jsonb,
	"last_check_at" timestamp,
	"last_check_by" varchar,
	"last_check_type" text DEFAULT 'manual',
	"ai_analysis" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_policy_signatures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"workspace_id" varchar,
	"policy_version" text DEFAULT '1.0' NOT NULL,
	"signature_hash" text NOT NULL,
	"certificate_data" jsonb,
	"ip_address" text,
	"user_agent" text,
	"device_fingerprint" text,
	"legal_acknowledgment" boolean DEFAULT false NOT NULL,
	"signed_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sovereign_policy_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"sector" text DEFAULT 'general' NOT NULL,
	"additional_policies" jsonb,
	"additional_checklist" jsonb,
	"compliance_frameworks" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_policy_versions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text NOT NULL,
	"version_number" integer NOT NULL,
	"policy_content" jsonb NOT NULL,
	"change_type" text DEFAULT 'update' NOT NULL,
	"change_summary" text,
	"change_summary_ar" text,
	"created_by" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp DEFAULT now(),
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_policy_violations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar,
	"workspace_id" varchar,
	"compliance_id" varchar,
	"policy_category" text NOT NULL,
	"policy_item" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text NOT NULL,
	"description_ar" text,
	"evidence" jsonb,
	"status" text DEFAULT 'open' NOT NULL,
	"resolution" text,
	"resolved_by" varchar,
	"resolved_at" timestamp,
	"detected_by" text DEFAULT 'manual' NOT NULL,
	"detected_at" timestamp DEFAULT now(),
	"notification_sent" boolean DEFAULT false,
	"notified_users" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_sensitive_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"operation_type" text NOT NULL,
	"operation_description" text,
	"target_resource" text,
	"password_verified_at" timestamp,
	"otp_code" varchar(6),
	"otp_sent_at" timestamp,
	"otp_sent_to" text,
	"otp_verified_at" timestamp,
	"otp_attempts" integer DEFAULT 0 NOT NULL,
	"activated_at" timestamp,
	"expires_at" timestamp,
	"last_activity_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	"device_info" jsonb,
	"completed_at" timestamp,
	"result" text,
	"result_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_workspace" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'Sovereign Workspace' NOT NULL,
	"name_ar" text DEFAULT 'مساحة العمل السيادية',
	"description" text,
	"description_ar" text,
	"owner_id" varchar NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_workspace_access_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" varchar,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sovereign_workspace_deployments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"version" text NOT NULL,
	"environment" text DEFAULT 'production' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"build_log" text,
	"build_duration" integer,
	"deployment_url" text,
	"deploy_duration" integer,
	"error_message" text,
	"triggered_by" varchar,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sovereign_workspace_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'AUDITOR' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"invited_by" varchar,
	"invited_at" timestamp,
	"accepted_at" timestamp,
	"last_access_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sovereign_workspace_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"platform_type" text DEFAULT 'custom' NOT NULL,
	"category" text DEFAULT 'commercial' NOT NULL,
	"tech_stack" jsonb,
	"deployment_status" text DEFAULT 'draft' NOT NULL,
	"deployment_url" text,
	"staging_url" text,
	"config" jsonb,
	"blueprint" jsonb,
	"html_code" text DEFAULT '' NOT NULL,
	"css_code" text DEFAULT '' NOT NULL,
	"js_code" text DEFAULT '' NOT NULL,
	"logo" text,
	"icon" text,
	"primary_color" text DEFAULT '#8B5CF6',
	"secondary_color" text DEFAULT '#EF4444',
	"repository_url" text,
	"last_build_at" timestamp,
	"last_deploy_at" timestamp,
	"version" text DEFAULT '0.1.0',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sovereign_workspace_projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "spom_audit_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar NOT NULL,
	"owner_email" text NOT NULL,
	"owner_name" text,
	"session_id" varchar,
	"operation_type" text NOT NULL,
	"operation_category" text NOT NULL,
	"action_taken" text NOT NULL,
	"target_resource" text,
	"target_path" text,
	"affected_page" text,
	"result" text NOT NULL,
	"result_details" text,
	"error_message" text,
	"previous_state" jsonb,
	"new_state" jsonb,
	"can_rollback" boolean DEFAULT false NOT NULL,
	"rollback_data" jsonb,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"browser_name" text,
	"os_name" text,
	"device_type" text,
	"executed_at" timestamp DEFAULT now() NOT NULL,
	"integrity_hash" text,
	"previous_log_id" varchar
);
--> statement-breakpoint
CREATE TABLE "spom_operations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"category" text NOT NULL,
	"risk_level" text DEFAULT 'medium' NOT NULL,
	"requires_password" boolean DEFAULT true NOT NULL,
	"requires_otp" boolean DEFAULT true NOT NULL,
	"session_duration_minutes" integer DEFAULT 15 NOT NULL,
	"warning_message" text,
	"warning_message_ar" text,
	"potential_risks" jsonb DEFAULT '[]'::jsonb,
	"potential_risks_ar" jsonb DEFAULT '[]'::jsonb,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "spom_operations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ssh_vault" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"server_host" text,
	"server_port" integer DEFAULT 22,
	"server_username" text,
	"key_type" text DEFAULT 'ed25519' NOT NULL,
	"key_fingerprint" text,
	"encrypted_private_key" text NOT NULL,
	"encrypted_public_key" text,
	"encrypted_passphrase" text,
	"encryption_version" integer DEFAULT 1 NOT NULL,
	"encryption_salt" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"access_level" text DEFAULT 'manage' NOT NULL,
	"allowed_ips" jsonb DEFAULT '[]'::jsonb,
	"allowed_operations" jsonb DEFAULT '["connect","deploy","manage"]'::jsonb,
	"last_used_at" timestamp,
	"usage_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"rotated_at" timestamp,
	"rotation_reminder" boolean DEFAULT true,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp,
	"revoked_by" varchar,
	"revoked_reason" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ssl_certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" varchar NOT NULL,
	"hostname" text NOT NULL,
	"provider" text DEFAULT 'letsencrypt' NOT NULL,
	"challenge_type" text DEFAULT 'dns-01' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"certificate_chain" text,
	"private_key_ref" text,
	"issued_at" timestamp,
	"expires_at" timestamp,
	"renew_after" timestamp,
	"last_renewal_at" timestamp,
	"renewal_attempts" integer DEFAULT 0 NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"last_error" text,
	"last_error_ar" text,
	"acme_order_url" text,
	"acme_challenge_token" text,
	"acme_challenge_response" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ssl_certificates_domain_id_unique" UNIQUE("domain_id")
);
--> statement-breakpoint
CREATE TABLE "subscriber_ai_limits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"max_power_level" integer DEFAULT 3 NOT NULL,
	"max_tokens_per_request" integer DEFAULT 2048 NOT NULL,
	"max_requests_per_day" integer DEFAULT 100 NOT NULL,
	"max_requests_per_minute" integer DEFAULT 10 NOT NULL,
	"allowed_task_types" jsonb DEFAULT '[]'::jsonb,
	"blocked_task_types" jsonb DEFAULT '[]'::jsonb,
	"can_access_external_ai" boolean DEFAULT false NOT NULL,
	"can_see_ai_layers" boolean DEFAULT false NOT NULL,
	"enforcement_action" text DEFAULT 'block' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar,
	"event_type" text NOT NULL,
	"previous_plan" text,
	"new_plan" text,
	"previous_price" integer,
	"new_price" integer,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"tagline" text,
	"tagline_ar" text,
	"role" text NOT NULL,
	"tier" text DEFAULT 'discovery' NOT NULL,
	"price_monthly" integer DEFAULT 0 NOT NULL,
	"price_quarterly" integer DEFAULT 0 NOT NULL,
	"price_semi_annual" integer DEFAULT 0 NOT NULL,
	"price_yearly" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features_ar" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"capabilities" jsonb,
	"limits" jsonb,
	"restrictions" jsonb,
	"max_projects" integer DEFAULT 1 NOT NULL,
	"max_pages_per_project" integer DEFAULT 5 NOT NULL,
	"ai_generations_per_month" integer DEFAULT 10 NOT NULL,
	"custom_domain" boolean DEFAULT false NOT NULL,
	"white_label" boolean DEFAULT false NOT NULL,
	"priority_support" boolean DEFAULT false NOT NULL,
	"analytics_access" boolean DEFAULT false NOT NULL,
	"chatbot_builder" boolean DEFAULT false NOT NULL,
	"team_members" integer DEFAULT 1 NOT NULL,
	"icon_name" text DEFAULT 'Zap',
	"accent_color" text DEFAULT '#6366f1',
	"gradient_from" text DEFAULT '#6366f1',
	"gradient_to" text DEFAULT '#8b5cf6',
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_contact_sales" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_agents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" text NOT NULL,
	"display_name_ar" text,
	"avatar" text,
	"status" text DEFAULT 'offline' NOT NULL,
	"status_message" text,
	"last_active_at" timestamp,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"languages" jsonb DEFAULT '["en","ar"]'::jsonb,
	"max_concurrent_chats" integer DEFAULT 5 NOT NULL,
	"current_chat_count" integer DEFAULT 0 NOT NULL,
	"total_sessions_handled" integer DEFAULT 0 NOT NULL,
	"average_rating" real DEFAULT 0,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"average_response_time" integer DEFAULT 0,
	"average_resolution_time" integer DEFAULT 0,
	"ai_copilot_enabled" boolean DEFAULT true NOT NULL,
	"ai_suggestions_enabled" boolean DEFAULT true NOT NULL,
	"ai_auto_translate" boolean DEFAULT false NOT NULL,
	"supervisor_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "support_agents_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "support_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_type" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"new_sessions" integer DEFAULT 0 NOT NULL,
	"resolved_sessions" integer DEFAULT 0 NOT NULL,
	"escalated_sessions" integer DEFAULT 0 NOT NULL,
	"sessions_by_channel" jsonb DEFAULT '{}'::jsonb,
	"sessions_by_category" jsonb DEFAULT '{}'::jsonb,
	"sessions_by_priority" jsonb DEFAULT '{}'::jsonb,
	"ai_handled_count" integer DEFAULT 0 NOT NULL,
	"ai_resolved_count" integer DEFAULT 0 NOT NULL,
	"ai_escalated_count" integer DEFAULT 0 NOT NULL,
	"average_ai_confidence" real DEFAULT 0,
	"average_first_response_time" integer DEFAULT 0,
	"average_resolution_time" integer DEFAULT 0,
	"sla_first_response_met" integer DEFAULT 0 NOT NULL,
	"sla_first_response_breached" integer DEFAULT 0 NOT NULL,
	"sla_resolution_met" integer DEFAULT 0 NOT NULL,
	"sla_resolution_breached" integer DEFAULT 0 NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"average_satisfaction" real DEFAULT 0,
	"satisfaction_breakdown" jsonb DEFAULT '{}'::jsonb,
	"agent_metrics" jsonb DEFAULT '[]'::jsonb,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_diagnostics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"diagnostic_type" text NOT NULL,
	"captured_data" jsonb DEFAULT '{}'::jsonb,
	"ai_analysis" text,
	"ai_analysis_ar" text,
	"ai_suggested_fixes" jsonb DEFAULT '[]'::jsonb,
	"ai_confidence" real DEFAULT 0,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_by" varchar,
	"resolution_notes" text,
	"captured_at" timestamp DEFAULT now(),
	"analyzed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "support_knowledge_base" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"content" text NOT NULL,
	"content_ar" text,
	"category" text NOT NULL,
	"subcategory" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"embedding" jsonb,
	"ai_relevance_score" real DEFAULT 0,
	"version" integer DEFAULT 1 NOT NULL,
	"previous_version_id" varchar,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"not_helpful_count" integer DEFAULT 0 NOT NULL,
	"derived_from_session_id" varchar,
	"last_ai_review" timestamp,
	"ai_suggested_updates" text,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "support_knowledge_base_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"sender_type" text NOT NULL,
	"sender_id" varchar,
	"sender_name" text,
	"content" text NOT NULL,
	"content_ar" text,
	"content_type" text DEFAULT 'text' NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"ai_confidence" real,
	"ai_suggested" boolean DEFAULT false NOT NULL,
	"ai_model_used" text,
	"is_internal" boolean DEFAULT false NOT NULL,
	"used_as_suggestion" boolean DEFAULT false NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_routing_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"match_category" text,
	"match_priority" text,
	"match_channel" text,
	"match_user_role" text,
	"match_keywords" jsonb DEFAULT '[]'::jsonb,
	"route_to_agent_id" varchar,
	"route_to_skill" text,
	"route_to_queue" text,
	"ai_first" boolean DEFAULT true NOT NULL,
	"ai_confidence_threshold" real DEFAULT 0.7,
	"priority_override" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" text NOT NULL,
	"user_id" varchar,
	"organization_id" varchar,
	"user_email" text,
	"user_name" text,
	"channel" text DEFAULT 'ai_chat' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"subcategory" text,
	"subject" text NOT NULL,
	"subject_ar" text,
	"summary" text,
	"summary_ar" text,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"ai_handled" boolean DEFAULT false NOT NULL,
	"ai_confidence" real DEFAULT 0,
	"ai_model_used" text,
	"ai_resolution_attempted" boolean DEFAULT false NOT NULL,
	"ai_escalation_reason" text,
	"assigned_agent_id" varchar,
	"assigned_at" timestamp,
	"last_agent_activity" timestamp,
	"sla_id" varchar,
	"sla_first_response_due" timestamp,
	"sla_resolution_due" timestamp,
	"sla_first_response_met" boolean,
	"sla_resolution_met" boolean,
	"platform_context" jsonb DEFAULT '{}'::jsonb,
	"ai_intent" text,
	"ai_sentiment" text,
	"risk_level" text DEFAULT 'low',
	"user_context" jsonb DEFAULT '{}'::jsonb,
	"ai_copilot_summary" text,
	"ai_copilot_summary_ar" text,
	"ai_suggested_responses" jsonb DEFAULT '[]'::jsonb,
	"ai_recommended_actions" jsonb DEFAULT '[]'::jsonb,
	"similar_case_ids" jsonb DEFAULT '[]'::jsonb,
	"linked_article_ids" jsonb DEFAULT '[]'::jsonb,
	"state_history" jsonb DEFAULT '[]'::jsonb,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution_type" text,
	"resolution_notes" text,
	"satisfaction_rating" integer,
	"satisfaction_feedback" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"closed_at" timestamp,
	CONSTRAINT "support_sessions_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "support_sla_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"target_role" text NOT NULL,
	"target_priority" text,
	"first_response_time" integer NOT NULL,
	"resolution_time" integer NOT NULL,
	"business_hours_only" boolean DEFAULT true NOT NULL,
	"business_hours_start" text DEFAULT '09:00',
	"business_hours_end" text DEFAULT '18:00',
	"business_days" jsonb DEFAULT '[1,2,3,4,5]'::jsonb,
	"timezone" text DEFAULT 'UTC',
	"auto_escalate_after" integer,
	"escalation_level" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_announcements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"title_ar" text NOT NULL,
	"message" text NOT NULL,
	"message_ar" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"target_plans" jsonb DEFAULT '[]'::jsonb,
	"target_user_ids" jsonb DEFAULT '[]'::jsonb,
	"is_dismissible" boolean DEFAULT true NOT NULL,
	"show_on_dashboard" boolean DEFAULT true NOT NULL,
	"show_on_login" boolean DEFAULT false NOT NULL,
	"show_as_banner" boolean DEFAULT false NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"dismiss_count" integer DEFAULT 0 NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"description_ar" text,
	"modifiable_by_subscribers" boolean DEFAULT false NOT NULL,
	"last_modified_by" varchar,
	"last_modified_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"category" text NOT NULL,
	"industry" text,
	"intelligence_level" text DEFAULT 'basic' NOT NULL,
	"monetization_type" text DEFAULT 'free' NOT NULL,
	"target_audience" text DEFAULT 'startup' NOT NULL,
	"platform_type" text DEFAULT 'marketing' NOT NULL,
	"setup_time_minutes" integer DEFAULT 15 NOT NULL,
	"frontend_capabilities" jsonb DEFAULT '[]'::jsonb,
	"business_logic_modules" jsonb DEFAULT '[]'::jsonb,
	"extensibility_hooks" jsonb DEFAULT '[]'::jsonb,
	"supported_integrations" jsonb DEFAULT '[]'::jsonb,
	"accent_color" text DEFAULT '#6366f1',
	"icon_name" text DEFAULT 'Sparkles',
	"preview_images" jsonb DEFAULT '[]'::jsonb,
	"html_code" text NOT NULL,
	"css_code" text NOT NULL,
	"js_code" text NOT NULL,
	"thumbnail" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"required_plan" text DEFAULT 'free' NOT NULL,
	"free_features" jsonb DEFAULT '[]'::jsonb,
	"paid_features" jsonb DEFAULT '[]'::jsonb,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"rating" real DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_domain_quotas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"max_domains" integer DEFAULT 1 NOT NULL,
	"used_domains" integer DEFAULT 0 NOT NULL,
	"max_verification_attempts" integer DEFAULT 10 NOT NULL,
	"can_use_wildcard" boolean DEFAULT false NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenant_domain_quotas_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "trust_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"category_ar" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"previous_score" integer,
	"trend" text DEFAULT 'stable' NOT NULL,
	"active_issues" integer DEFAULT 0 NOT NULL,
	"resolved_issues" integer DEFAULT 0 NOT NULL,
	"details" jsonb,
	"measured_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "unified_blueprints" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"name_ar" text,
	"description" text,
	"description_ar" text,
	"version" text DEFAULT '1.0.0',
	"definition" jsonb NOT NULL,
	"generated_surfaces" jsonb DEFAULT '{}'::jsonb,
	"is_valid" boolean DEFAULT false NOT NULL,
	"validation_errors" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"message" text NOT NULL,
	"message_ar" text,
	"threshold_value" real,
	"current_value" real,
	"percent_of_limit" real,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_at" timestamp,
	"action_taken" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_admin_roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"role_id" varchar NOT NULL,
	"assigned_by" varchar NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"country_code" text NOT NULL,
	"country_name" text NOT NULL,
	"country_name_ar" text,
	"region_code" text,
	"region_name" text,
	"city" text,
	"timezone" text,
	"ip_address" text,
	"is_vpn" boolean DEFAULT false,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_notification_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"enabled_channels" jsonb DEFAULT '["DASHBOARD","EMAIL"]'::jsonb,
	"timezone" text DEFAULT 'UTC',
	"quiet_hours_start" text,
	"quiet_hours_end" text,
	"respect_quiet_hours" boolean DEFAULT true NOT NULL,
	"type_preferences" jsonb DEFAULT '[]'::jsonb,
	"enable_batching" boolean DEFAULT true NOT NULL,
	"batch_interval_minutes" integer DEFAULT 30,
	"email_digest" text DEFAULT 'instant',
	"phone_number" text,
	"enable_sms" boolean DEFAULT false NOT NULL,
	"enable_push" boolean DEFAULT true NOT NULL,
	"push_subscription" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"payment_method" text DEFAULT 'manual' NOT NULL,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_usage_limits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"monthly_limit_usd" real DEFAULT 50,
	"daily_limit_usd" real,
	"auto_suspend" boolean DEFAULT true NOT NULL,
	"notify_at_percent" integer DEFAULT 80,
	"ai_tokens_limit" integer,
	"api_requests_limit" integer,
	"storage_limit_mb" integer,
	"current_month_usage_usd" real DEFAULT 0,
	"current_day_usage_usd" real DEFAULT 0,
	"last_reset_date" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"username" text,
	"password" text,
	"full_name" text,
	"first_name" text,
	"last_name" text,
	"avatar" text,
	"profile_image_url" text,
	"auth_provider" text DEFAULT 'email' NOT NULL,
	"role" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'ar' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status_changed_at" timestamp,
	"status_changed_by" varchar,
	"status_reason" text,
	"last_login_at" timestamp,
	"last_login_ip" text,
	"failed_login_attempts" integer DEFAULT 0,
	"two_factor_secret" text,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_recovery_codes" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vault_access_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_token" text NOT NULL,
	"password_verified" boolean DEFAULT false NOT NULL,
	"password_verified_at" timestamp,
	"totp_verified" boolean DEFAULT false NOT NULL,
	"totp_verified_at" timestamp,
	"email_code_verified" boolean DEFAULT false NOT NULL,
	"email_code_verified_at" timestamp,
	"email_code" text,
	"email_code_expires_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	"device_fingerprint" text,
	"is_fully_authenticated" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vault_access_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "vault_audit_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"key_id" varchar,
	"session_id" varchar,
	"action" text NOT NULL,
	"action_detail" text,
	"ip_address" text,
	"user_agent" text,
	"geo_location" text,
	"success" boolean NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"signature" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"status_code" integer,
	"response_body" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp,
	"delivered_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_endpoints" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"secret_hash" text NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"last_delivery_at" timestamp,
	"last_delivery_status" text,
	"last_delivery_error" text,
	"retry_policy" jsonb DEFAULT '{"maxRetries":3,"retryIntervalSeconds":60}'::jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"provider" text DEFAULT 'stripe' NOT NULL,
	"payload_hash" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"error_message" text,
	"related_user_id" varchar,
	"related_subscription_id" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "webhook_logs_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "white_label_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" varchar NOT NULL,
	"brand_name" text NOT NULL,
	"brand_name_ar" text,
	"tagline" text,
	"tagline_ar" text,
	"primary_color" text,
	"secondary_color" text,
	"accent_color" text,
	"color_scheme" jsonb,
	"primary_font" text,
	"secondary_font" text,
	"custom_domain" text,
	"sub_domain" text,
	"support_email" text,
	"support_phone" text,
	"company_name" text,
	"company_name_ar" text,
	"registration_number" text,
	"social_links" jsonb,
	"custom_settings" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "white_label_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"brand_name" text NOT NULL,
	"brand_name_ar" text,
	"logo_url" text,
	"favicon_url" text,
	"primary_color" varchar(7) DEFAULT '#8B5CF6' NOT NULL,
	"secondary_color" varchar(7),
	"custom_domain" text,
	"custom_css" text,
	"hide_watermark" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "white_label_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "active_contributors" ADD CONSTRAINT "active_contributors_context_id_collaboration_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."collaboration_contexts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_messages" ADD CONSTRAINT "agent_messages_conversation_id_agent_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."agent_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_decision_memory" ADD CONSTRAINT "ai_decision_memory_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_decision_memory" ADD CONSTRAINT "ai_decision_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_decision_memory" ADD CONSTRAINT "ai_decision_memory_conversation_id_sovereign_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."sovereign_conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_forecast_runs" ADD CONSTRAINT "ai_forecast_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_global_settings" ADD CONSTRAINT "ai_global_settings_kill_switch_activated_by_users_id_fk" FOREIGN KEY ("kill_switch_activated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_global_settings" ADD CONSTRAINT "ai_global_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_audit_logs" ADD CONSTRAINT "ai_model_audit_logs_model_id_ai_model_registry_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_model_registry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_audit_logs" ADD CONSTRAINT "ai_model_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_intake_jobs" ADD CONSTRAINT "ai_model_intake_jobs_model_id_ai_model_registry_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_model_registry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_intake_jobs" ADD CONSTRAINT "ai_model_intake_jobs_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_policies" ADD CONSTRAINT "ai_model_policies_model_id_ai_model_registry_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_model_registry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_registry" ADD CONSTRAINT "ai_model_registry_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_runtimes" ADD CONSTRAINT "ai_model_runtimes_model_id_ai_model_registry_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_model_registry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_orchestration_rules" ADD CONSTRAINT "ai_orchestration_rules_primary_model_id_ai_model_registry_id_fk" FOREIGN KEY ("primary_model_id") REFERENCES "public"."ai_model_registry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_power_configs" ADD CONSTRAINT "ai_power_configs_layer_id_ai_layers_id_fk" FOREIGN KEY ("layer_id") REFERENCES "public"."ai_layers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_provider_configs" ADD CONSTRAINT "ai_provider_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_provider_configs" ADD CONSTRAINT "ai_provider_configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_scenarios" ADD CONSTRAINT "ai_scenarios_forecast_run_id_ai_forecast_runs_id_fk" FOREIGN KEY ("forecast_run_id") REFERENCES "public"."ai_forecast_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_scenarios" ADD CONSTRAINT "ai_scenarios_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_service_configs" ADD CONSTRAINT "ai_service_configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_ai_generations" ADD CONSTRAINT "app_ai_generations_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_ai_generations" ADD CONSTRAINT "app_ai_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_build_history" ADD CONSTRAINT "app_build_history_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_projects" ADD CONSTRAINT "app_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_conversations" ADD CONSTRAINT "assistant_conversations_relationship_id_assistant_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."assistant_relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_run_id_audit_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."audit_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_target_id_audit_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."audit_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_runs" ADD CONSTRAINT "audit_runs_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branding_assets" ADD CONSTRAINT "branding_assets_ownership_id_platform_ownerships_id_fk" FOREIGN KEY ("ownership_id") REFERENCES "public"."platform_ownerships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branding_assets" ADD CONSTRAINT "branding_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_contexts" ADD CONSTRAINT "collaboration_contexts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_decisions" ADD CONSTRAINT "collaboration_decisions_context_id_collaboration_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."collaboration_contexts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_context_id_collaboration_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."collaboration_contexts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_auth_sessions" ADD CONSTRAINT "command_auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_execution_logs" ADD CONSTRAINT "command_execution_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_security_settings" ADD CONSTRAINT "command_security_settings_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_indicators" ADD CONSTRAINT "compliance_indicators_domain_id_sovereign_compliance_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."sovereign_compliance_domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_disputes" ADD CONSTRAINT "contract_disputes_contract_id_digital_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."digital_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_disputes" ADD CONSTRAINT "contract_disputes_filed_by_users_id_fk" FOREIGN KEY ("filed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_disputes" ADD CONSTRAINT "contract_disputes_against_party_users_id_fk" FOREIGN KEY ("against_party") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_disputes" ADD CONSTRAINT "contract_disputes_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_contract_id_digital_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."digital_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_signer_id_users_id_fk" FOREIGN KEY ("signer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_sovereign_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."sovereign_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_restore_points" ADD CONSTRAINT "conversation_restore_points_session_id_encrypted_ai_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."encrypted_ai_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_search_index" ADD CONSTRAINT "conversation_search_index_session_id_encrypted_ai_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."encrypted_ai_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_search_index" ADD CONSTRAINT "conversation_search_index_message_id_encrypted_conversation_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."encrypted_conversation_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_usage_aggregates" ADD CONSTRAINT "daily_usage_aggregates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_policy_regions" ADD CONSTRAINT "data_policy_regions_policy_id_data_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."data_policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_policy_regions" ADD CONSTRAINT "data_policy_regions_region_id_data_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."data_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_region_metrics" ADD CONSTRAINT "data_region_metrics_region_id_data_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."data_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deleted_items" ADD CONSTRAINT "deleted_items_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deleted_items" ADD CONSTRAINT "deleted_items_recovered_by_users_id_fk" FOREIGN KEY ("recovered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deleted_platforms_ledger" ADD CONSTRAINT "deleted_platforms_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deleted_platforms_ledger" ADD CONSTRAINT "deleted_platforms_ledger_restored_by_users_id_fk" FOREIGN KEY ("restored_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deleted_platforms_ledger" ADD CONSTRAINT "deleted_platforms_ledger_permanent_deleted_by_users_id_fk" FOREIGN KEY ("permanent_deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deletion_attempts" ADD CONSTRAINT "deletion_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deletion_audit_logs" ADD CONSTRAINT "deletion_audit_logs_action_by_users_id_fk" FOREIGN KEY ("action_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployment_manifests" ADD CONSTRAINT "deployment_manifests_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployment_manifests" ADD CONSTRAINT "deployment_manifests_last_applied_by_users_id_fk" FOREIGN KEY ("last_applied_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployment_manifests" ADD CONSTRAINT "deployment_manifests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_build_runs" ADD CONSTRAINT "dev_build_runs_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_build_runs" ADD CONSTRAINT "dev_build_runs_workspace_id_dev_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."dev_workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_build_runs" ADD CONSTRAINT "dev_build_runs_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_commands" ADD CONSTRAINT "dev_commands_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_commands" ADD CONSTRAINT "dev_commands_workspace_id_dev_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."dev_workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_commands" ADD CONSTRAINT "dev_commands_executed_by_users_id_fk" FOREIGN KEY ("executed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_deploy_runs" ADD CONSTRAINT "dev_deploy_runs_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_deploy_runs" ADD CONSTRAINT "dev_deploy_runs_workspace_id_dev_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."dev_workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_deploy_runs" ADD CONSTRAINT "dev_deploy_runs_build_run_id_dev_build_runs_id_fk" FOREIGN KEY ("build_run_id") REFERENCES "public"."dev_build_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_deploy_runs" ADD CONSTRAINT "dev_deploy_runs_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_deploy_runs" ADD CONSTRAINT "dev_deploy_runs_rolled_back_by_users_id_fk" FOREIGN KEY ("rolled_back_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_files" ADD CONSTRAINT "dev_files_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_files" ADD CONSTRAINT "dev_files_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isds_projects" ADD CONSTRAINT "isds_projects_workspace_id_dev_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."dev_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isds_projects" ADD CONSTRAINT "isds_projects_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_workspaces" ADD CONSTRAINT "dev_workspaces_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_contracts" ADD CONSTRAINT "digital_contracts_template_id_contract_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."contract_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_contracts" ADD CONSTRAINT "digital_contracts_ownership_id_platform_ownerships_id_fk" FOREIGN KEY ("ownership_id") REFERENCES "public"."platform_ownerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_contracts" ADD CONSTRAINT "digital_contracts_license_id_franchise_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."franchise_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_contracts" ADD CONSTRAINT "digital_contracts_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_contracts" ADD CONSTRAINT "digital_contracts_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_contracts" ADD CONSTRAINT "digital_contracts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_platform_links" ADD CONSTRAINT "domain_platform_links_domain_id_namecheap_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."namecheap_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_tasks" ADD CONSTRAINT "employee_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_tasks" ADD CONSTRAINT "employee_tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_tasks" ADD CONSTRAINT "employee_tasks_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encrypted_conversation_messages" ADD CONSTRAINT "encrypted_conversation_messages_session_id_encrypted_ai_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."encrypted_ai_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_artifacts" ADD CONSTRAINT "execution_artifacts_job_id_execution_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."execution_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_jobs" ADD CONSTRAINT "execution_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_jobs" ADD CONSTRAINT "execution_jobs_runtime_id_execution_runtimes_id_fk" FOREIGN KEY ("runtime_id") REFERENCES "public"."execution_runtimes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "failover_groups" ADD CONSTRAINT "failover_groups_primary_provider_id_service_providers_id_fk" FOREIGN KEY ("primary_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_team_id_finance_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."finance_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_invoices" ADD CONSTRAINT "finance_invoices_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_invoices" ADD CONSTRAINT "finance_invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_invoices" ADD CONSTRAINT "finance_invoices_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_invoices" ADD CONSTRAINT "finance_invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_team_id_finance_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."finance_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_reconciled_by_users_id_fk" FOREIGN KEY ("reconciled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_reconciliations" ADD CONSTRAINT "finance_reconciliations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_reconciliations" ADD CONSTRAINT "finance_reconciliations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_reconciliations" ADD CONSTRAINT "finance_reconciliations_adjustment_ledger_id_finance_ledger_id_fk" FOREIGN KEY ("adjustment_ledger_id") REFERENCES "public"."finance_ledger"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_reconciliations" ADD CONSTRAINT "finance_reconciliations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_teams" ADD CONSTRAINT "finance_teams_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_licenses" ADD CONSTRAINT "franchise_licenses_ownership_id_platform_ownerships_id_fk" FOREIGN KEY ("ownership_id") REFERENCES "public"."platform_ownerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_licenses" ADD CONSTRAINT "franchise_licenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_licenses" ADD CONSTRAINT "franchise_licenses_licensee_id_users_id_fk" FOREIGN KEY ("licensee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hetzner_deployments" ADD CONSTRAINT "hetzner_deployments_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hetzner_deployments" ADD CONSTRAINT "hetzner_deployments_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icon_regeneration_requests" ADD CONSTRAINT "icon_regeneration_requests_platform_icon_id_platform_icons_id_fk" FOREIGN KEY ("platform_icon_id") REFERENCES "public"."platform_icons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icon_regeneration_requests" ADD CONSTRAINT "icon_regeneration_requests_result_version_id_platform_icon_versions_id_fk" FOREIGN KEY ("result_version_id") REFERENCES "public"."platform_icon_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_agent_config" ADD CONSTRAINT "infera_agent_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_agent_executions" ADD CONSTRAINT "infera_agent_executions_task_id_infera_agent_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."infera_agent_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_agent_files" ADD CONSTRAINT "infera_agent_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_agent_logs" ADD CONSTRAINT "infera_agent_logs_task_id_infera_agent_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."infera_agent_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_agent_logs" ADD CONSTRAINT "infera_agent_logs_execution_id_infera_agent_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."infera_agent_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_agent_tasks" ADD CONSTRAINT "infera_agent_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_agent_tasks" ADD CONSTRAINT "infera_agent_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_anomaly_alerts" ADD CONSTRAINT "infera_anomaly_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_api_keys" ADD CONSTRAINT "infera_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_api_keys" ADD CONSTRAINT "infera_api_keys_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_api_usage_logs" ADD CONSTRAINT "infera_api_usage_logs_api_key_id_infera_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."infera_api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_api_usage_logs" ADD CONSTRAINT "infera_api_usage_logs_model_id_infera_intelligence_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."infera_intelligence_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_client_subscriptions" ADD CONSTRAINT "infera_client_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_client_subscriptions" ADD CONSTRAINT "infera_client_subscriptions_api_key_id_infera_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."infera_api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_client_webhooks" ADD CONSTRAINT "infera_client_webhooks_api_key_id_infera_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."infera_api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_client_webhooks" ADD CONSTRAINT "infera_client_webhooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_compliance_reports" ADD CONSTRAINT "infera_compliance_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_compliance_reports" ADD CONSTRAINT "infera_compliance_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_intelligence_models" ADD CONSTRAINT "infera_intelligence_models_backend_model_id_ai_model_registry_id_fk" FOREIGN KEY ("backend_model_id") REFERENCES "public"."ai_model_registry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_intelligence_models" ADD CONSTRAINT "infera_intelligence_models_fallback_model_id_ai_model_registry_id_fk" FOREIGN KEY ("fallback_model_id") REFERENCES "public"."ai_model_registry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_intelligence_models" ADD CONSTRAINT "infera_intelligence_models_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_model_audit_log" ADD CONSTRAINT "infera_model_audit_log_model_id_infera_intelligence_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."infera_intelligence_models"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_model_audit_log" ADD CONSTRAINT "infera_model_audit_log_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_platforms" ADD CONSTRAINT "infera_platforms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_provider_health_metrics" ADD CONSTRAINT "infera_provider_health_metrics_provider_id_infera_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."infera_ai_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_routing_rules" ADD CONSTRAINT "infera_routing_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infera_webhook_delivery_logs" ADD CONSTRAINT "infera_webhook_delivery_logs_webhook_id_infera_client_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."infera_client_webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_inventory" ADD CONSTRAINT "infrastructure_inventory_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_inventory" ADD CONSTRAINT "infrastructure_inventory_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutional_memory" ADD CONSTRAINT "institutional_memory_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutional_memory" ADD CONSTRAINT "institutional_memory_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_audit_logs" ADD CONSTRAINT "integration_audit_logs_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_audit_logs" ADD CONSTRAINT "integration_audit_logs_api_key_id_provider_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."provider_api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_audit_logs" ADD CONSTRAINT "license_audit_logs_license_id_franchise_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."franchise_licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_audit_logs" ADD CONSTRAINT "license_audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_installations" ADD CONSTRAINT "marketplace_installations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_installations" ADD CONSTRAINT "marketplace_installations_item_id_marketplace_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."marketplace_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_installations" ADD CONSTRAINT "marketplace_installations_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_usage_summary" ADD CONSTRAINT "monthly_usage_summary_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "namecheap_contacts" ADD CONSTRAINT "namecheap_contacts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "namecheap_dns_records" ADD CONSTRAINT "namecheap_dns_records_domain_id_namecheap_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."namecheap_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "namecheap_domains" ADD CONSTRAINT "namecheap_domains_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "namecheap_operation_logs" ADD CONSTRAINT "namecheap_operation_logs_domain_id_namecheap_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."namecheap_domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "namecheap_operation_logs" ADD CONSTRAINT "namecheap_operation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_analytics" ADD CONSTRAINT "navigation_analytics_resource_id_navigation_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."navigation_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_shortcuts" ADD CONSTRAINT "navigation_shortcuts_resource_id_navigation_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."navigation_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_decision_audit" ADD CONSTRAINT "nova_decision_audit_decision_id_nova_sovereign_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."nova_sovereign_decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_decision_steps" ADD CONSTRAINT "nova_decision_steps_decision_id_nova_sovereign_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."nova_sovereign_decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_decisions" ADD CONSTRAINT "nova_decisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_decisions" ADD CONSTRAINT "nova_decisions_session_id_nova_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."nova_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_decisions" ADD CONSTRAINT "nova_decisions_message_id_nova_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."nova_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_decisions" ADD CONSTRAINT "nova_decisions_superseded_by_nova_decisions_id_fk" FOREIGN KEY ("superseded_by") REFERENCES "public"."nova_decisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_messages" ADD CONSTRAINT "nova_messages_session_id_nova_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."nova_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_model_lifecycle" ADD CONSTRAINT "nova_model_lifecycle_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_permission_grants" ADD CONSTRAINT "nova_permission_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_preferences" ADD CONSTRAINT "nova_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_project_contexts" ADD CONSTRAINT "nova_project_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nova_sessions" ADD CONSTRAINT "nova_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_tokens" ADD CONSTRAINT "otp_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_milestones" ADD CONSTRAINT "plan_milestones_plan_id_sovereign_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."sovereign_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_certificates" ADD CONSTRAINT "platform_certificates_platform_id_infera_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."infera_platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_certificates" ADD CONSTRAINT "platform_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_certificates" ADD CONSTRAINT "platform_certificates_parent_cert_id_platform_certificates_id_fk" FOREIGN KEY ("parent_cert_id") REFERENCES "public"."platform_certificates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_certificates" ADD CONSTRAINT "platform_certificates_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_icon_versions" ADD CONSTRAINT "platform_icon_versions_platform_icon_id_platform_icons_id_fk" FOREIGN KEY ("platform_icon_id") REFERENCES "public"."platform_icons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_links" ADD CONSTRAINT "platform_links_source_platform_id_infera_platforms_id_fk" FOREIGN KEY ("source_platform_id") REFERENCES "public"."infera_platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_links" ADD CONSTRAINT "platform_links_target_platform_id_infera_platforms_id_fk" FOREIGN KEY ("target_platform_id") REFERENCES "public"."infera_platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_links" ADD CONSTRAINT "platform_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_ownership_transfers" ADD CONSTRAINT "platform_ownership_transfers_ownership_id_platform_ownerships_id_fk" FOREIGN KEY ("ownership_id") REFERENCES "public"."platform_ownerships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_ownership_transfers" ADD CONSTRAINT "platform_ownership_transfers_from_owner_id_users_id_fk" FOREIGN KEY ("from_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_ownership_transfers" ADD CONSTRAINT "platform_ownership_transfers_to_owner_id_users_id_fk" FOREIGN KEY ("to_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_ownership_transfers" ADD CONSTRAINT "platform_ownership_transfers_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_ownerships" ADD CONSTRAINT "platform_ownerships_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_ownerships" ADD CONSTRAINT "platform_ownerships_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_services" ADD CONSTRAINT "platform_services_platform_id_infera_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."infera_platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_tokens" ADD CONSTRAINT "platform_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_tokens" ADD CONSTRAINT "platform_tokens_revoked_by_users_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platforms" ADD CONSTRAINT "platforms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_brain" ADD CONSTRAINT "project_brain_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_brain" ADD CONSTRAINT "project_brain_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_alerts" ADD CONSTRAINT "provider_alerts_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_api_keys" ADD CONSTRAINT "provider_api_keys_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_services" ADD CONSTRAINT "provider_services_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_usage" ADD CONSTRAINT "provider_usage_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_usage" ADD CONSTRAINT "provider_usage_service_id_provider_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."provider_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_usage" ADD CONSTRAINT "provider_usage_api_key_id_provider_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."provider_api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycle_bin" ADD CONSTRAINT "recycle_bin_deleted_item_id_deleted_items_id_fk" FOREIGN KEY ("deleted_item_id") REFERENCES "public"."deleted_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycle_bin" ADD CONSTRAINT "recycle_bin_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_actions" ADD CONSTRAINT "remediation_actions_finding_id_risk_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."risk_findings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_actions" ADD CONSTRAINT "remediation_actions_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_actions" ADD CONSTRAINT "remediation_actions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restore_points" ADD CONSTRAINT "restore_points_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restore_points" ADD CONSTRAINT "restore_points_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_findings" ADD CONSTRAINT "risk_findings_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_findings" ADD CONSTRAINT "risk_findings_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets_vault_entries" ADD CONSTRAINT "secrets_vault_entries_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sidebar_pages" ADD CONSTRAINT "sidebar_pages_section_key_sidebar_sections_section_key_fk" FOREIGN KEY ("section_key") REFERENCES "public"."sidebar_sections"("section_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sidebar_user_preferences" ADD CONSTRAINT "sidebar_user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sidebar_visibility_logs" ADD CONSTRAINT "sidebar_visibility_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_ai_agents" ADD CONSTRAINT "sovereign_ai_agents_layer_id_ai_layers_id_fk" FOREIGN KEY ("layer_id") REFERENCES "public"."ai_layers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_audit_log" ADD CONSTRAINT "sovereign_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_conversations" ADD CONSTRAINT "sovereign_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_conversations" ADD CONSTRAINT "sovereign_conversations_project_id_isds_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."isds_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_conversations" ADD CONSTRAINT "sovereign_conversations_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_owner_profile" ADD CONSTRAINT "sovereign_owner_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_plans" ADD CONSTRAINT "sovereign_plans_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_plans" ADD CONSTRAINT "sovereign_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_compliance" ADD CONSTRAINT "sovereign_policy_compliance_project_id_sovereign_workspace_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."sovereign_workspace_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_compliance" ADD CONSTRAINT "sovereign_policy_compliance_workspace_id_sovereign_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."sovereign_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_compliance" ADD CONSTRAINT "sovereign_policy_compliance_last_check_by_users_id_fk" FOREIGN KEY ("last_check_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_signatures" ADD CONSTRAINT "sovereign_policy_signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_signatures" ADD CONSTRAINT "sovereign_policy_signatures_workspace_id_sovereign_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."sovereign_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_templates" ADD CONSTRAINT "sovereign_policy_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_versions" ADD CONSTRAINT "sovereign_policy_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_violations" ADD CONSTRAINT "sovereign_policy_violations_project_id_sovereign_workspace_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."sovereign_workspace_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_violations" ADD CONSTRAINT "sovereign_policy_violations_workspace_id_sovereign_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."sovereign_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_violations" ADD CONSTRAINT "sovereign_policy_violations_compliance_id_sovereign_policy_compliance_id_fk" FOREIGN KEY ("compliance_id") REFERENCES "public"."sovereign_policy_compliance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_policy_violations" ADD CONSTRAINT "sovereign_policy_violations_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_sensitive_sessions" ADD CONSTRAINT "sovereign_sensitive_sessions_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace" ADD CONSTRAINT "sovereign_workspace_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_access_logs" ADD CONSTRAINT "sovereign_workspace_access_logs_workspace_id_sovereign_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."sovereign_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_access_logs" ADD CONSTRAINT "sovereign_workspace_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_deployments" ADD CONSTRAINT "sovereign_workspace_deployments_project_id_sovereign_workspace_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."sovereign_workspace_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_deployments" ADD CONSTRAINT "sovereign_workspace_deployments_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_members" ADD CONSTRAINT "sovereign_workspace_members_workspace_id_sovereign_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."sovereign_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_members" ADD CONSTRAINT "sovereign_workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_members" ADD CONSTRAINT "sovereign_workspace_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_projects" ADD CONSTRAINT "sovereign_workspace_projects_workspace_id_sovereign_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."sovereign_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sovereign_workspace_projects" ADD CONSTRAINT "sovereign_workspace_projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spom_audit_log" ADD CONSTRAINT "spom_audit_log_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spom_audit_log" ADD CONSTRAINT "spom_audit_log_session_id_sovereign_sensitive_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sovereign_sensitive_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ssh_vault" ADD CONSTRAINT "ssh_vault_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_agents" ADD CONSTRAINT "support_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_agents" ADD CONSTRAINT "support_agents_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_diagnostics" ADD CONSTRAINT "support_diagnostics_session_id_support_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."support_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_diagnostics" ADD CONSTRAINT "support_diagnostics_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_knowledge_base" ADD CONSTRAINT "support_knowledge_base_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_knowledge_base" ADD CONSTRAINT "support_knowledge_base_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_session_id_support_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."support_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_routing_rules" ADD CONSTRAINT "support_routing_rules_route_to_agent_id_support_agents_id_fk" FOREIGN KEY ("route_to_agent_id") REFERENCES "public"."support_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_sessions" ADD CONSTRAINT "support_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_sessions" ADD CONSTRAINT "support_sessions_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_sessions" ADD CONSTRAINT "support_sessions_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_employee_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."employee_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_alerts" ADD CONSTRAINT "usage_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD CONSTRAINT "user_usage_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_access_sessions" ADD CONSTRAINT "vault_access_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "white_label_profiles" ADD CONSTRAINT "white_label_profiles_license_id_franchise_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."franchise_licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "white_label_profiles" ADD CONSTRAINT "white_label_profiles_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_contributor_id" ON "active_contributors" USING btree ("contributor_id");--> statement-breakpoint
CREATE INDEX "IDX_contributor_context" ON "active_contributors" USING btree ("context_id");--> statement-breakpoint
CREATE INDEX "IDX_contributor_status" ON "active_contributors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_contributor_active" ON "active_contributors" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "IDX_agent_conv_session" ON "agent_conversations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_conv_user" ON "agent_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_conv_created" ON "agent_conversations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_agent_msg_conv" ON "agent_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_msg_created" ON "agent_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_ai_billing_insights_user" ON "ai_billing_insights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_billing_insights_type" ON "ai_billing_insights" USING btree ("insight_type");--> statement-breakpoint
CREATE INDEX "IDX_ai_billing_insights_status" ON "ai_billing_insights" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ai_billing_insights_severity" ON "ai_billing_insights" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_ai_role" ON "ai_collaborators" USING btree ("role");--> statement-breakpoint
CREATE INDEX "IDX_ai_active" ON "ai_collaborators" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_adm_project_id" ON "ai_decision_memory" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_adm_user_id" ON "ai_decision_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_adm_decision_type" ON "ai_decision_memory" USING btree ("decision_type");--> statement-breakpoint
CREATE INDEX "IDX_adm_impact_level" ON "ai_decision_memory" USING btree ("impact_level");--> statement-breakpoint
CREATE INDEX "IDX_forecast_status" ON "ai_forecast_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_forecast_created" ON "ai_forecast_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_forecast_user" ON "ai_forecast_runs" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_audit_model" ON "ai_model_audit_logs" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_audit_action" ON "ai_model_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_audit_actor" ON "ai_model_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_audit_created" ON "ai_model_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_intake_model" ON "ai_model_intake_jobs" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_intake_status" ON "ai_model_intake_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_intake_type" ON "ai_model_intake_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_policies_model" ON "ai_model_policies" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_policies_active" ON "ai_model_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_registry_provider" ON "ai_model_registry" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_registry_type" ON "ai_model_registry" USING btree ("model_type");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_registry_status" ON "ai_model_registry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_registry_intake" ON "ai_model_registry" USING btree ("intake_method");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_runtimes_model" ON "ai_model_runtimes" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_runtimes_engine" ON "ai_model_runtimes" USING btree ("engine");--> statement-breakpoint
CREATE INDEX "IDX_ai_model_runtimes_active" ON "ai_model_runtimes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_ai_orchestration_primary" ON "ai_orchestration_rules" USING btree ("primary_model_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_orchestration_active" ON "ai_orchestration_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_ai_adapter_provider" ON "ai_provider_adapters" USING btree ("provider_key");--> statement-breakpoint
CREATE INDEX "IDX_ai_adapter_enabled" ON "ai_provider_adapters" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "IDX_ai_provider" ON "ai_provider_configs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "IDX_scenario_type" ON "ai_scenarios" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_scenario_status" ON "ai_scenarios" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_scenario_forecast" ON "ai_scenarios" USING btree ("forecast_run_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_service_name" ON "ai_service_configs" USING btree ("service_name");--> statement-breakpoint
CREATE INDEX "IDX_ai_service_type" ON "ai_service_configs" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "IDX_ai_service_mode" ON "ai_service_configs" USING btree ("ai_mode");--> statement-breakpoint
CREATE INDEX "IDX_ai_service_sidebar" ON "ai_service_configs" USING btree ("sidebar_path");--> statement-breakpoint
CREATE INDEX "IDX_ai_usage_provider" ON "ai_usage_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "IDX_ai_usage_created" ON "ai_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_ai_usage_user" ON "ai_usage_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_stats_provider_date" ON "ai_usage_stats" USING btree ("provider","date");--> statement-breakpoint
CREATE INDEX "IDX_rule_type" ON "analysis_rules" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_rule_active" ON "analysis_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_analytics_user" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_analytics_project" ON "analytics_events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_analytics_type" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "IDX_analytics_date" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_api_audit_tenant" ON "api_audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "IDX_api_audit_api_key" ON "api_audit_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "IDX_api_audit_action" ON "api_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_api_audit_timestamp" ON "api_audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_api_audit_severity" ON "api_audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_api_usage_key" ON "api_key_usage_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "IDX_api_usage_tenant" ON "api_key_usage_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "IDX_api_usage_timestamp" ON "api_key_usage_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_api_keys_tenant" ON "api_keys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "IDX_api_keys_user" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_api_keys_status" ON "api_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_api_keys_prefix" ON "api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "IDX_ai_gen_proj" ON "app_ai_generations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_gen_user" ON "app_ai_generations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_ai_gen_type" ON "app_ai_generations" USING btree ("generation_type");--> statement-breakpoint
CREATE INDEX "IDX_build_hist_proj" ON "app_build_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_build_hist_status" ON "app_build_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_app_proj_user" ON "app_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_app_proj_type" ON "app_projects" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_app_proj_status" ON "app_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ap_project" ON "architecture_patterns" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_ap_type" ON "architecture_patterns" USING btree ("pattern_type");--> statement-breakpoint
CREATE INDEX "IDX_ap_anti" ON "architecture_patterns" USING btree ("is_anti_pattern");--> statement-breakpoint
CREATE INDEX "IDX_assist_conv_rel" ON "assistant_conversations" USING btree ("relationship_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_conv_sender" ON "assistant_conversations" USING btree ("sender_assistant_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_conv_receiver" ON "assistant_conversations" USING btree ("receiver_assistant_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_conv_time" ON "assistant_conversations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_assist_audit_entity" ON "assistant_permission_audit" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_audit_assistant" ON "assistant_permission_audit" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_audit_actor" ON "assistant_permission_audit" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_audit_time" ON "assistant_permission_audit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_assist_rel_source" ON "assistant_relationships" USING btree ("source_assistant_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_rel_target" ON "assistant_relationships" USING btree ("target_assistant_id");--> statement-breakpoint
CREATE INDEX "IDX_assist_rel_status" ON "assistant_relationships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_assist_wg_code" ON "assistant_workgroups" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_assist_wg_active" ON "assistant_workgroups" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_audit_finding_run" ON "audit_findings" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "IDX_audit_finding_target" ON "audit_findings" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "IDX_audit_finding_classification" ON "audit_findings" USING btree ("classification");--> statement-breakpoint
CREATE INDEX "IDX_audit_finding_priority" ON "audit_findings" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_audit_run_status" ON "audit_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_audit_run_initiated" ON "audit_runs" USING btree ("initiated_by");--> statement-breakpoint
CREATE INDEX "IDX_audit_run_created" ON "audit_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_audit_target_testid" ON "audit_targets" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "IDX_audit_target_type" ON "audit_targets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_audit_target_path" ON "audit_targets" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_billing_profiles_user" ON "billing_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_billing_profiles_default" ON "billing_profiles" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "IDX_branding_ownership" ON "branding_assets" USING btree ("ownership_id");--> statement-breakpoint
CREATE INDEX "IDX_branding_type" ON "branding_assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "IDX_branding_active" ON "branding_assets" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_bc_project" ON "build_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_bc_platform" ON "build_configs" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "IDX_bj_project" ON "build_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_bj_status" ON "build_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_bj_platform" ON "build_jobs" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "IDX_analysis_project" ON "code_analysis_sessions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_analysis_user" ON "code_analysis_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_context_type" ON "collaboration_contexts" USING btree ("context_type");--> statement-breakpoint
CREATE INDEX "IDX_context_project" ON "collaboration_contexts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_context_status" ON "collaboration_contexts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_context_activity" ON "collaboration_contexts" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "IDX_decision_context" ON "collaboration_decisions" USING btree ("context_id");--> statement-breakpoint
CREATE INDEX "IDX_decision_status" ON "collaboration_decisions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_decision_proposed" ON "collaboration_decisions" USING btree ("proposed_at");--> statement-breakpoint
CREATE INDEX "IDX_message_context" ON "collaboration_messages" USING btree ("context_id");--> statement-breakpoint
CREATE INDEX "IDX_message_sender" ON "collaboration_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "IDX_message_action" ON "collaboration_messages" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "IDX_message_time" ON "collaboration_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_cmd_auth_user" ON "command_auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_cmd_auth_expires" ON "command_auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "IDX_cmd_auth_device" ON "command_auth_sessions" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "IDX_cmd_def_key" ON "command_definitions" USING btree ("command_key");--> statement-breakpoint
CREATE INDEX "IDX_cmd_def_category" ON "command_definitions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_cmd_def_risk" ON "command_definitions" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "IDX_cmd_log_user" ON "command_execution_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_cmd_log_command" ON "command_execution_logs" USING btree ("command_key");--> statement-breakpoint
CREATE INDEX "IDX_cmd_log_executed" ON "command_execution_logs" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "IDX_cmd_log_result" ON "command_execution_logs" USING btree ("result");--> statement-breakpoint
CREATE INDEX "IDX_framework_code" ON "compliance_frameworks" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_framework_status" ON "compliance_frameworks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_indicator_domain" ON "compliance_indicators" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "IDX_indicator_status" ON "compliance_indicators" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_dispute_contract" ON "contract_disputes" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "IDX_dispute_filed_by" ON "contract_disputes" USING btree ("filed_by");--> statement-breakpoint
CREATE INDEX "IDX_dispute_status" ON "contract_disputes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_signature_contract" ON "contract_signatures" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "IDX_signature_signer" ON "contract_signatures" USING btree ("signer_id");--> statement-breakpoint
CREATE INDEX "IDX_signature_verified" ON "contract_signatures" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "IDX_template_code" ON "contract_templates" USING btree ("template_code");--> statement-breakpoint
CREATE INDEX "IDX_template_type" ON "contract_templates" USING btree ("contract_type");--> statement-breakpoint
CREATE INDEX "IDX_template_active" ON "contract_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_msg_conversation_id" ON "conversation_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "IDX_msg_role" ON "conversation_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "IDX_msg_created_at" ON "conversation_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_restore_point_session" ON "conversation_restore_points" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_restore_point_auto" ON "conversation_restore_points" USING btree ("is_automatic");--> statement-breakpoint
CREATE INDEX "IDX_search_index_session" ON "conversation_search_index" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_search_index_message" ON "conversation_search_index" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "IDX_cost_source" ON "cost_attributions" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "IDX_cost_period" ON "cost_attributions" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "IDX_csr_requests_user" ON "csr_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_csr_requests_domain" ON "csr_requests" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "IDX_csr_requests_status" ON "csr_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_custom_domains_tenant" ON "custom_domains" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "IDX_custom_domains_owner" ON "custom_domains" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "IDX_custom_domains_system" ON "custom_domains" USING btree ("is_system_domain");--> statement-breakpoint
CREATE INDEX "IDX_custom_domains_status" ON "custom_domains" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_daily_user" ON "daily_usage_aggregates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_daily_date" ON "daily_usage_aggregates" USING btree ("date");--> statement-breakpoint
CREATE INDEX "IDX_daily_country" ON "daily_usage_aggregates" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "IDX_policy_regions_policy" ON "data_policy_regions" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "IDX_policy_regions_region" ON "data_policy_regions" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "IDX_region_metrics_region" ON "data_region_metrics" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "IDX_region_metrics_date" ON "data_region_metrics" USING btree ("metric_date");--> statement-breakpoint
CREATE INDEX "IDX_deleted_entity" ON "deleted_items" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "IDX_deleted_by" ON "deleted_items" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "IDX_deleted_at" ON "deleted_items" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "IDX_deleted_status" ON "deleted_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_deleted_expires" ON "deleted_items" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "IDX_dpl_user_id" ON "deleted_platforms_ledger" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_dpl_original_id" ON "deleted_platforms_ledger" USING btree ("original_id");--> statement-breakpoint
CREATE INDEX "IDX_dpl_deletion_phase" ON "deleted_platforms_ledger" USING btree ("deletion_phase");--> statement-breakpoint
CREATE INDEX "IDX_dpl_restore_deadline" ON "deleted_platforms_ledger" USING btree ("restore_deadline");--> statement-breakpoint
CREATE INDEX "IDX_deletion_user" ON "deletion_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_deletion_entity" ON "deletion_attempts" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "IDX_deletion_time" ON "deletion_attempts" USING btree ("attempted_at");--> statement-breakpoint
CREATE INDEX "IDX_audit_action" ON "deletion_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_audit_by" ON "deletion_audit_logs" USING btree ("action_by");--> statement-breakpoint
CREATE INDEX "IDX_audit_target" ON "deletion_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "IDX_audit_time" ON "deletion_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_dm_dept" ON "department_members" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "IDX_dm_user" ON "department_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_dept_parent" ON "departments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "IDX_dept_manager" ON "departments" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "IDX_dept_status" ON "departments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_dc_project" ON "deployment_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_dc_env" ON "deployment_configs" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "IDX_deploy_manifest_project" ON "deployment_manifests" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_deploy_manifest_type" ON "deployment_manifests" USING btree ("manifest_type");--> statement-breakpoint
CREATE INDEX "IDX_deploy_manifest_env" ON "deployment_manifests" USING btree ("target_environment");--> statement-breakpoint
CREATE INDEX "IDX_deployment_server" ON "deployment_runs" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "IDX_deployment_status" ON "deployment_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_dep_project" ON "deployments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_dep_status" ON "deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_dep_started" ON "deployments" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "IDX_build_run_project" ON "dev_build_runs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_build_run_workspace" ON "dev_build_runs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_build_run_status" ON "dev_build_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_build_run_trigger" ON "dev_build_runs" USING btree ("trigger");--> statement-breakpoint
CREATE INDEX "IDX_build_run_created" ON "dev_build_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_build_run_number" ON "dev_build_runs" USING btree ("project_id","build_number");--> statement-breakpoint
CREATE INDEX "IDX_dev_command_project" ON "dev_commands" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_dev_command_workspace" ON "dev_commands" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_dev_command_user" ON "dev_commands" USING btree ("executed_by");--> statement-breakpoint
CREATE INDEX "IDX_dev_command_type" ON "dev_commands" USING btree ("command_type");--> statement-breakpoint
CREATE INDEX "IDX_dev_command_status" ON "dev_commands" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_dev_command_created" ON "dev_commands" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_deploy_run_project" ON "dev_deploy_runs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_deploy_run_workspace" ON "dev_deploy_runs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_deploy_run_status" ON "dev_deploy_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_deploy_run_environment" ON "dev_deploy_runs" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "IDX_deploy_run_created" ON "dev_deploy_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_deploy_run_number" ON "dev_deploy_runs" USING btree ("project_id","deploy_number");--> statement-breakpoint
CREATE INDEX "IDX_deploy_run_build" ON "dev_deploy_runs" USING btree ("build_run_id");--> statement-breakpoint
CREATE INDEX "IDX_dev_file_project" ON "dev_files" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_dev_file_path" ON "dev_files" USING btree ("project_id","path");--> statement-breakpoint
CREATE INDEX "IDX_dev_file_parent" ON "dev_files" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "IDX_dev_file_type" ON "dev_files" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "IDX_dev_project_workspace" ON "isds_projects" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_dev_project_slug" ON "isds_projects" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "IDX_dev_project_status" ON "isds_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_dev_project_type" ON "isds_projects" USING btree ("project_type");--> statement-breakpoint
CREATE INDEX "IDX_workspace_slug" ON "dev_workspaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "IDX_workspace_owner" ON "dev_workspaces" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_workspace_status" ON "dev_workspaces" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_workspace_visibility" ON "dev_workspaces" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "IDX_contract_number" ON "digital_contracts" USING btree ("contract_number");--> statement-breakpoint
CREATE INDEX "IDX_contract_type" ON "digital_contracts" USING btree ("contract_type");--> statement-breakpoint
CREATE INDEX "IDX_contract_seller" ON "digital_contracts" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "IDX_contract_buyer" ON "digital_contracts" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "IDX_contract_status" ON "digital_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_contract_ownership" ON "digital_contracts" USING btree ("ownership_id");--> statement-breakpoint
CREATE INDEX "IDX_dpl_domain" ON "domain_platform_links" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "IDX_dpl_platform" ON "domain_platform_links" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "IDX_domain_verifications_domain" ON "domain_verifications" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "IDX_domain_verifications_status" ON "domain_verifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_task_assigned" ON "employee_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "IDX_task_assignedby" ON "employee_tasks" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "IDX_task_dept" ON "employee_tasks" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "IDX_task_status" ON "employee_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_task_priority" ON "employee_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_task_due" ON "employee_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "IDX_encrypted_session_owner" ON "encrypted_ai_sessions" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_encrypted_session_status" ON "encrypted_ai_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_encrypted_session_id" ON "encrypted_ai_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_encrypted_msg_session" ON "encrypted_conversation_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_encrypted_msg_sequence" ON "encrypted_conversation_messages" USING btree ("sequence_number");--> statement-breakpoint
CREATE INDEX "IDX_encrypted_msg_type" ON "encrypted_conversation_messages" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "IDX_encrypted_msg_hash" ON "encrypted_conversation_messages" USING btree ("searchable_hash");--> statement-breakpoint
CREATE INDEX "IDX_encryption_key_id" ON "encryption_keys_registry" USING btree ("key_id");--> statement-breakpoint
CREATE INDEX "IDX_encryption_key_active" ON "encryption_keys_registry" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_encryption_key_purpose" ON "encryption_keys_registry" USING btree ("purpose");--> statement-breakpoint
CREATE INDEX "IDX_exec_artifact_job" ON "execution_artifacts" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "IDX_exec_artifact_project" ON "execution_artifacts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_exec_artifact_type" ON "execution_artifacts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_exec_job_project" ON "execution_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_exec_job_user" ON "execution_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_exec_job_status" ON "execution_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_exec_job_created" ON "execution_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_exec_runtime_type" ON "execution_runtimes" USING btree ("runtime_type");--> statement-breakpoint
CREATE INDEX "IDX_exec_runtime_active" ON "execution_runtimes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_integration_log_session" ON "external_integration_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_integration_log_type" ON "external_integration_logs" USING btree ("operation_type");--> statement-breakpoint
CREATE INDEX "IDX_integration_partner" ON "external_integration_sessions" USING btree ("partner_name");--> statement-breakpoint
CREATE INDEX "IDX_integration_status" ON "external_integration_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_failover_category" ON "failover_groups" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_budget_code" ON "finance_budgets" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_budget_fiscal_year" ON "finance_budgets" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "IDX_budget_category" ON "finance_budgets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_budget_status" ON "finance_budgets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_budget_team" ON "finance_budgets" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "IDX_budget_owner" ON "finance_budgets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_budget_period" ON "finance_budgets" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "IDX_invoice_number" ON "finance_invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "IDX_invoice_customer" ON "finance_invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_invoice_status" ON "finance_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_invoice_issue_date" ON "finance_invoices" USING btree ("issue_date");--> statement-breakpoint
CREATE INDEX "IDX_invoice_due_date" ON "finance_invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "IDX_invoice_recurring" ON "finance_invoices" USING btree ("is_recurring");--> statement-breakpoint
CREATE INDEX "IDX_ledger_entry_number" ON "finance_ledger" USING btree ("entry_number");--> statement-breakpoint
CREATE INDEX "IDX_ledger_entry_type" ON "finance_ledger" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "IDX_ledger_status" ON "finance_ledger" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ledger_user" ON "finance_ledger" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_ledger_team" ON "finance_ledger" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "IDX_ledger_transaction_date" ON "finance_ledger" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "IDX_ledger_reconciled" ON "finance_ledger" USING btree ("is_reconciled");--> statement-breakpoint
CREATE INDEX "IDX_reconciliation_number" ON "finance_reconciliations" USING btree ("reconciliation_number");--> statement-breakpoint
CREATE INDEX "IDX_reconciliation_type" ON "finance_reconciliations" USING btree ("reconciliation_type");--> statement-breakpoint
CREATE INDEX "IDX_reconciliation_status" ON "finance_reconciliations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_reconciliation_period" ON "finance_reconciliations" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "IDX_reconciliation_assigned" ON "finance_reconciliations" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "IDX_finance_team_code" ON "finance_teams" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_finance_team_manager" ON "finance_teams" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "IDX_finance_team_status" ON "finance_teams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_license_number" ON "franchise_licenses" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "IDX_license_ownership" ON "franchise_licenses" USING btree ("ownership_id");--> statement-breakpoint
CREATE INDEX "IDX_license_licensee" ON "franchise_licenses" USING btree ("licensee_id");--> statement-breakpoint
CREATE INDEX "IDX_license_type" ON "franchise_licenses" USING btree ("license_type");--> statement-breakpoint
CREATE INDEX "IDX_license_status" ON "franchise_licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_license_expiry" ON "franchise_licenses" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "IDX_ha_project" ON "health_alerts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_ha_status" ON "health_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ha_severity" ON "health_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_hetzner_server_id" ON "hetzner_deployments" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "IDX_hetzner_project_id" ON "hetzner_deployments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_hetzner_owner_id" ON "hetzner_deployments" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_regen_request_platform" ON "icon_regeneration_requests" USING btree ("platform_icon_id");--> statement-breakpoint
CREATE INDEX "IDX_regen_request_status" ON "icon_regeneration_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_audit_hash" ON "immutable_audit_trail" USING btree ("current_hash");--> statement-breakpoint
CREATE INDEX "IDX_audit_merkle" ON "immutable_audit_trail" USING btree ("merkle_root");--> statement-breakpoint
CREATE INDEX "IDX_audit_block" ON "immutable_audit_trail" USING btree ("block_number");--> statement-breakpoint
CREATE INDEX "IDX_agent_config_key" ON "infera_agent_config" USING btree ("key");--> statement-breakpoint
CREATE INDEX "IDX_agent_config_category" ON "infera_agent_config" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_agent_exec_task" ON "infera_agent_executions" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_exec_tool" ON "infera_agent_executions" USING btree ("tool");--> statement-breakpoint
CREATE INDEX "IDX_agent_exec_status" ON "infera_agent_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_agent_files_path" ON "infera_agent_files" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_agent_files_project" ON "infera_agent_files" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_files_ext" ON "infera_agent_files" USING btree ("extension");--> statement-breakpoint
CREATE INDEX "IDX_agent_logs_task" ON "infera_agent_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_logs_exec" ON "infera_agent_logs" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_logs_level" ON "infera_agent_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "IDX_agent_logs_created" ON "infera_agent_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_agent_tasks_user" ON "infera_agent_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_tasks_project" ON "infera_agent_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_tasks_status" ON "infera_agent_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_agent_tasks_priority" ON "infera_agent_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_infera_providers_name" ON "infera_ai_providers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "IDX_infera_providers_status" ON "infera_ai_providers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infera_providers_priority" ON "infera_ai_providers" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_infera_alerts_type" ON "infera_anomaly_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "IDX_infera_alerts_severity" ON "infera_anomaly_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_infera_alerts_status" ON "infera_anomaly_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infera_alerts_target" ON "infera_anomaly_alerts" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_alerts_created" ON "infera_anomaly_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_infera_api_keys_user" ON "infera_api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_api_keys_status" ON "infera_api_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infera_api_keys_prefix" ON "infera_api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "IDX_infera_usage_api_key" ON "infera_api_usage_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_usage_model" ON "infera_api_usage_logs" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_usage_created" ON "infera_api_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_infera_subs_user" ON "infera_client_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_subs_stripe" ON "infera_client_subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_subs_plan" ON "infera_client_subscriptions" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "IDX_infera_subs_status" ON "infera_client_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infera_webhooks_key" ON "infera_client_webhooks" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_webhooks_active" ON "infera_client_webhooks" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_infera_reports_type" ON "infera_compliance_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "IDX_infera_reports_period" ON "infera_compliance_reports" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "IDX_infera_reports_status" ON "infera_compliance_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infera_models_role" ON "infera_intelligence_models" USING btree ("functional_role");--> statement-breakpoint
CREATE INDEX "IDX_infera_models_level" ON "infera_intelligence_models" USING btree ("service_level");--> statement-breakpoint
CREATE INDEX "IDX_infera_models_status" ON "infera_intelligence_models" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infera_models_backend" ON "infera_intelligence_models" USING btree ("backend_model_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_audit_model" ON "infera_model_audit_log" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_audit_action" ON "infera_model_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_infera_audit_created" ON "infera_model_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_ip_code" ON "infera_platforms" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_ip_platform_type" ON "infera_platforms" USING btree ("platform_type");--> statement-breakpoint
CREATE INDEX "IDX_ip_status" ON "infera_platforms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ip_owner_id" ON "infera_platforms" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_health_provider" ON "infera_provider_health_metrics" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_health_timestamp" ON "infera_provider_health_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_infera_health_bucket" ON "infera_provider_health_metrics" USING btree ("bucket");--> statement-breakpoint
CREATE INDEX "IDX_infera_routing_type" ON "infera_routing_rules" USING btree ("rule_type");--> statement-breakpoint
CREATE INDEX "IDX_infera_routing_active" ON "infera_routing_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_infera_routing_priority" ON "infera_routing_rules" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_infera_webhook_logs_webhook" ON "infera_webhook_delivery_logs" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "IDX_infera_webhook_logs_status" ON "infera_webhook_delivery_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infera_webhook_logs_created" ON "infera_webhook_delivery_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "infrastructure_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "infrastructure_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_target" ON "infrastructure_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "infrastructure_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_provider" ON "infrastructure_audit_logs" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_backup_server" ON "infrastructure_backups" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "IDX_backup_status" ON "infrastructure_backups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_cost_alert_type" ON "infrastructure_cost_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "IDX_cost_alert_status" ON "infrastructure_cost_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infra_inv_provider" ON "infrastructure_inventory" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "IDX_infra_inv_type" ON "infrastructure_inventory" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "IDX_infra_inv_status" ON "infrastructure_inventory" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_infra_inv_project" ON "infrastructure_inventory" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_server_provider" ON "infrastructure_servers" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_server_status" ON "infrastructure_servers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_server_project" ON "infrastructure_servers" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_inst_memory_project" ON "institutional_memory" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_inst_memory_type" ON "institutional_memory" USING btree ("node_type");--> statement-breakpoint
CREATE INDEX "IDX_inst_memory_status" ON "institutional_memory" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_inst_memory_importance" ON "institutional_memory" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "IDX_int_audit_provider" ON "integration_audit_logs" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_int_audit_action" ON "integration_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_int_audit_date" ON "integration_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_integ_cred_type" ON "integration_credentials" USING btree ("integration_type");--> statement-breakpoint
CREATE INDEX "IDX_integ_cred_provider" ON "integration_credentials" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "IDX_integ_cred_project" ON "integration_credentials" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_integ_cred_owner" ON "integration_credentials" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_invoices_user" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_clause_code" ON "legal_clauses" USING btree ("clause_code");--> statement-breakpoint
CREATE INDEX "IDX_clause_category" ON "legal_clauses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_clause_mandatory" ON "legal_clauses" USING btree ("is_mandatory");--> statement-breakpoint
CREATE INDEX "IDX_license_audit_license" ON "license_audit_logs" USING btree ("license_id");--> statement-breakpoint
CREATE INDEX "IDX_license_audit_action" ON "license_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_license_audit_created" ON "license_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_login_sessions_user" ON "login_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_login_sessions_active" ON "login_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_campaigns_user" ON "marketing_campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_campaigns_status" ON "marketing_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_installation_user" ON "marketplace_installations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_installation_item" ON "marketplace_installations" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "IDX_marketplace_type" ON "marketplace_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_marketplace_category" ON "marketplace_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_marketplace_featured" ON "marketplace_items" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "IDX_ms_project" ON "metrics_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_ms_timestamp" ON "metrics_snapshots" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_monthly_user" ON "monthly_usage_summary" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_monthly_period" ON "monthly_usage_summary" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "IDX_nc_contact_owner" ON "namecheap_contacts" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_nc_dns_domain" ON "namecheap_dns_records" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "IDX_nc_dns_type" ON "namecheap_dns_records" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "IDX_nc_domain_owner" ON "namecheap_domains" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_nc_domain_status" ON "namecheap_domains" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_nc_domain_expires" ON "namecheap_domains" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "IDX_nc_log_domain" ON "namecheap_operation_logs" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "IDX_nc_log_user" ON "namecheap_operation_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_nc_log_operation" ON "namecheap_operation_logs" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "IDX_nc_log_created" ON "namecheap_operation_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_nav_analytics_resource" ON "navigation_analytics" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "IDX_nav_analytics_path" ON "navigation_analytics" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_nav_analytics_date" ON "navigation_analytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "IDX_nav_res_code" ON "navigation_resources" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_nav_res_path" ON "navigation_resources" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_nav_res_category" ON "navigation_resources" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_nav_res_enabled" ON "navigation_resources" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "IDX_nav_search_user" ON "navigation_search_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_nav_search_query" ON "navigation_search_history" USING btree ("query");--> statement-breakpoint
CREATE INDEX "IDX_nav_search_time" ON "navigation_search_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_nav_short_code" ON "navigation_shortcuts" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_nav_short_enabled" ON "navigation_shortcuts" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "IDX_nav_user_state_user" ON "navigation_user_state" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_analytics_period" ON "notification_analytics" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE INDEX "IDX_escalation_notification" ON "notification_escalations" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "IDX_nac_active" ON "nova_approval_chains" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_nda_decision" ON "nova_decision_audit" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "IDX_nda_timestamp" ON "nova_decision_audit" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_nda_phase" ON "nova_decision_audit" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "IDX_nda_actor" ON "nova_decision_audit" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "IDX_nds_decision" ON "nova_decision_steps" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "IDX_nds_order" ON "nova_decision_steps" USING btree ("order");--> statement-breakpoint
CREATE INDEX "IDX_nds_status" ON "nova_decision_steps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_nd_user_id" ON "nova_decisions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_nd_session_id" ON "nova_decisions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_nd_category" ON "nova_decisions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_nd_status" ON "nova_decisions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_nhil_category" ON "nova_human_in_loop" USING btree ("decision_category");--> statement-breakpoint
CREATE INDEX "IDX_nhil_type" ON "nova_human_in_loop" USING btree ("decision_type");--> statement-breakpoint
CREATE INDEX "IDX_nhil_active" ON "nova_human_in_loop" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_nks_active" ON "nova_kill_switch" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_nkg_type" ON "nova_knowledge_graph" USING btree ("node_type");--> statement-breakpoint
CREATE INDEX "IDX_nkg_active" ON "nova_knowledge_graph" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_nm_session_id" ON "nova_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_nm_role" ON "nova_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "IDX_nm_created" ON "nova_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_nml_model" ON "nova_model_lifecycle" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "IDX_nml_stage" ON "nova_model_lifecycle" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "IDX_nml_timestamp" ON "nova_model_lifecycle" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_nova_audit_user" ON "nova_permission_audit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_nova_audit_actor" ON "nova_permission_audit" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "IDX_nova_audit_time" ON "nova_permission_audit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_nova_grant_user" ON "nova_permission_grants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_nova_grant_perm" ON "nova_permission_grants" USING btree ("permission_code");--> statement-breakpoint
CREATE INDEX "IDX_nova_grant_active" ON "nova_permission_grants" USING btree ("user_id","is_granted");--> statement-breakpoint
CREATE INDEX "IDX_nova_preset_code" ON "nova_permission_presets" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_nova_perm_code" ON "nova_permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_nova_perm_category" ON "nova_permissions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_nova_perm_security" ON "nova_permissions" USING btree ("security_level");--> statement-breakpoint
CREATE INDEX "IDX_np_type" ON "nova_policies" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_np_scope" ON "nova_policies" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "IDX_np_active" ON "nova_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_npm_type" ON "nova_policy_memory" USING btree ("memory_type");--> statement-breakpoint
CREATE INDEX "IDX_npm_key" ON "nova_policy_memory" USING btree ("key");--> statement-breakpoint
CREATE INDEX "IDX_npm_active" ON "nova_policy_memory" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_np_user_id" ON "nova_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_npc_project_id" ON "nova_project_contexts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_npc_user_id" ON "nova_project_contexts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_ns_user_id" ON "nova_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_ns_project_id" ON "nova_sessions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_ns_status" ON "nova_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ns_last_message" ON "nova_sessions" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "IDX_nsd_phase" ON "nova_sovereign_decisions" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "IDX_nsd_type" ON "nova_sovereign_decisions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_nsd_risk" ON "nova_sovereign_decisions" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "IDX_nsd_created" ON "nova_sovereign_decisions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_otp_email" ON "otp_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_otp_code" ON "otp_tokens" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_page_api_calls_path" ON "page_api_calls" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_page_api_calls_endpoint" ON "page_api_calls" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "IDX_page_api_calls_service" ON "page_api_calls" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "IDX_page_components_path" ON "page_components" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_page_components_name" ON "page_components" USING btree ("component_name");--> statement-breakpoint
CREATE INDEX "IDX_page_components_type" ON "page_components" USING btree ("component_type");--> statement-breakpoint
CREATE INDEX "IDX_page_service_metrics_path" ON "page_service_metrics" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_page_service_metrics_date" ON "page_service_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "IDX_payment_retry_user" ON "payment_retry_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_payment_retry_subscription" ON "payment_retry_queue" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "IDX_payment_retry_status" ON "payment_retry_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_payment_retry_next" ON "payment_retry_queue" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "IDX_milestone_plan" ON "plan_milestones" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "IDX_pc_platform_id" ON "platform_certificates" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "IDX_pc_user_id" ON "platform_certificates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_pc_hierarchy_role" ON "platform_certificates" USING btree ("hierarchy_role");--> statement-breakpoint
CREATE INDEX "IDX_pc_is_revoked" ON "platform_certificates" USING btree ("is_revoked");--> statement-breakpoint
CREATE INDEX "IDX_pc_valid_until" ON "platform_certificates" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "IDX_icon_version_platform" ON "platform_icon_versions" USING btree ("platform_icon_id");--> statement-breakpoint
CREATE INDEX "IDX_icon_version_platform_id" ON "platform_icon_versions" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "IDX_icon_version_current" ON "platform_icon_versions" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "IDX_platform_icon_platform" ON "platform_icons" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "IDX_platform_icon_category" ON "platform_icons" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_pl_source" ON "platform_links" USING btree ("source_platform_id");--> statement-breakpoint
CREATE INDEX "IDX_pl_target" ON "platform_links" USING btree ("target_platform_id");--> statement-breakpoint
CREATE INDEX "IDX_pl_status" ON "platform_links" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_platform_transfer_ownership" ON "platform_ownership_transfers" USING btree ("ownership_id");--> statement-breakpoint
CREATE INDEX "IDX_platform_transfer_from" ON "platform_ownership_transfers" USING btree ("from_owner_id");--> statement-breakpoint
CREATE INDEX "IDX_platform_transfer_to" ON "platform_ownership_transfers" USING btree ("to_owner_id");--> statement-breakpoint
CREATE INDEX "IDX_platform_transfer_status" ON "platform_ownership_transfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_ownership_project" ON "platform_ownerships" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_ownership_owner" ON "platform_ownerships" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_ownership_reg" ON "platform_ownerships" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "IDX_ps_platform_id" ON "platform_services" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "IDX_ps_service_kind" ON "platform_services" USING btree ("service_kind");--> statement-breakpoint
CREATE INDEX "IDX_ps_status" ON "platform_services" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_pt_platform_id" ON "platform_tokens" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "IDX_pt_user_id" ON "platform_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_pt_token_type" ON "platform_tokens" USING btree ("token_type");--> statement-breakpoint
CREATE INDEX "IDX_platforms_owner" ON "platforms" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_platforms_status" ON "platforms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_platforms_slug" ON "platforms" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "IDX_pricing_type" ON "pricing_config" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "IDX_pricing_provider" ON "pricing_config" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "IDX_project_auth_project" ON "project_auth_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_project_backend_project" ON "project_backends" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_pb_project_id" ON "project_brain" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_pb_user_id" ON "project_brain" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_project_database_project" ON "project_databases" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_pel_project" ON "project_event_log" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_pel_type" ON "project_event_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "IDX_pel_time" ON "project_event_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_improvement_project" ON "project_improvement_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_improvement_type" ON "project_improvement_history" USING btree ("improvement_type");--> statement-breakpoint
CREATE INDEX "IDX_pke_project" ON "project_knowledge_edges" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_pke_source" ON "project_knowledge_edges" USING btree ("source_node_id");--> statement-breakpoint
CREATE INDEX "IDX_pke_target" ON "project_knowledge_edges" USING btree ("target_node_id");--> statement-breakpoint
CREATE INDEX "IDX_pkn_project" ON "project_knowledge_nodes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_pkn_type" ON "project_knowledge_nodes" USING btree ("node_type");--> statement-breakpoint
CREATE INDEX "IDX_pkn_active" ON "project_knowledge_nodes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_provisioning_job_project" ON "project_provisioning_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_provisioning_job_status" ON "project_provisioning_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_alerts_provider" ON "provider_alerts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_alerts_severity" ON "provider_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_alerts_acknowledged" ON "provider_alerts" USING btree ("is_acknowledged");--> statement-breakpoint
CREATE INDEX "IDX_api_keys_provider" ON "provider_api_keys" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_api_keys_environment" ON "provider_api_keys" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "IDX_provider_credentials_provider" ON "provider_credentials" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_provider_error_provider" ON "provider_error_logs" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_provider_error_type" ON "provider_error_logs" USING btree ("error_type");--> statement-breakpoint
CREATE INDEX "idx_provider_error_created" ON "provider_error_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_services_provider" ON "provider_services" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_usage_provider" ON "provider_usage" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "IDX_usage_date" ON "provider_usage" USING btree ("date");--> statement-breakpoint
CREATE INDEX "IDX_usage_service" ON "provider_usage" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "IDX_recycle_owner" ON "recycle_bin" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_recycle_deleted_item" ON "recycle_bin" USING btree ("deleted_item_id");--> statement-breakpoint
CREATE INDEX "IDX_recycle_purge" ON "recycle_bin" USING btree ("scheduled_purge_at");--> statement-breakpoint
CREATE INDEX "IDX_refunds_payment" ON "refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "IDX_refunds_user" ON "refunds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_refunds_status" ON "refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_remediation_finding" ON "remediation_actions" USING btree ("finding_id");--> statement-breakpoint
CREATE INDEX "IDX_remediation_status" ON "remediation_actions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_remediation_assigned" ON "remediation_actions" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "IDX_res_usage_user" ON "resource_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_res_usage_type" ON "resource_usage" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "IDX_res_usage_provider" ON "resource_usage" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "IDX_res_usage_timestamp" ON "resource_usage" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "IDX_res_usage_country" ON "resource_usage" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "IDX_rp_project_id" ON "restore_points" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_rp_user_id" ON "restore_points" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_rp_type" ON "restore_points" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_rp_created_at" ON "restore_points" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_risk_category" ON "risk_findings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_risk_severity" ON "risk_findings" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_risk_status" ON "risk_findings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_risk_assigned" ON "risk_findings" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "IDX_secrets_vault_path" ON "secrets_vault_entries" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_secrets_vault_project" ON "secrets_vault_entries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_secrets_vault_scope" ON "secrets_vault_entries" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "IDX_secrets_vault_type" ON "secrets_vault_entries" USING btree ("secret_type");--> statement-breakpoint
CREATE INDEX "IDX_security_severity" ON "security_incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_security_status" ON "security_incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_providers_category" ON "service_providers" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_providers_status" ON "service_providers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_providers_slug" ON "service_providers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_page_key" ON "sidebar_pages" USING btree ("page_key");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_page_section" ON "sidebar_pages" USING btree ("section_key");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_page_path" ON "sidebar_pages" USING btree ("path");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_page_order" ON "sidebar_pages" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_section_key" ON "sidebar_sections" USING btree ("section_key");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_section_order" ON "sidebar_sections" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_user_pref_user" ON "sidebar_user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_log_target" ON "sidebar_visibility_logs" USING btree ("target_type","target_key");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_log_changed_by" ON "sidebar_visibility_logs" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "IDX_sidebar_log_created" ON "sidebar_visibility_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_suggestion_session" ON "smart_suggestions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_suggestion_project" ON "smart_suggestions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_suggestion_type" ON "smart_suggestions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_suggestion_priority" ON "smart_suggestions" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_suggestion_status" ON "smart_suggestions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_sal_user_id" ON "sovereign_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_sal_project_id" ON "sovereign_audit_log" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_sal_category" ON "sovereign_audit_log" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_sal_action" ON "sovereign_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_sal_created_at" ON "sovereign_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_sal_is_critical" ON "sovereign_audit_log" USING btree ("is_critical");--> statement-breakpoint
CREATE INDEX "IDX_compliance_domain_code" ON "sovereign_compliance_domains" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_compliance_domain_status" ON "sovereign_compliance_domains" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_conv_user_id" ON "sovereign_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_conv_project_id" ON "sovereign_conversations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_conv_status" ON "sovereign_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_conv_created_at" ON "sovereign_conversations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_notification_target" ON "sovereign_notifications" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "IDX_notification_priority" ON "sovereign_notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_notification_status" ON "sovereign_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_notification_type" ON "sovereign_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_notification_owner" ON "sovereign_notifications" USING btree ("is_owner_only");--> statement-breakpoint
CREATE INDEX "IDX_sovereign_plan_code" ON "sovereign_plans" USING btree ("plan_code");--> statement-breakpoint
CREATE INDEX "IDX_sovereign_plan_status" ON "sovereign_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_sovereign_plan_phase" ON "sovereign_plans" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "IDX_policy_compliance_project" ON "sovereign_policy_compliance" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_policy_compliance_workspace" ON "sovereign_policy_compliance" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_policy_compliance_status" ON "sovereign_policy_compliance" USING btree ("overall_status");--> statement-breakpoint
CREATE INDEX "IDX_policy_signature_user" ON "sovereign_policy_signatures" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_policy_signature_workspace" ON "sovereign_policy_signatures" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_policy_template_sector" ON "sovereign_policy_templates" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "IDX_policy_template_active" ON "sovereign_policy_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_policy_version_active" ON "sovereign_policy_versions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_policy_version_number" ON "sovereign_policy_versions" USING btree ("version_number");--> statement-breakpoint
CREATE INDEX "IDX_policy_violation_project" ON "sovereign_policy_violations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_policy_violation_severity" ON "sovereign_policy_violations" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "IDX_policy_violation_status" ON "sovereign_policy_violations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_spom_sess_owner" ON "sovereign_sensitive_sessions" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_spom_sess_status" ON "sovereign_sensitive_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_sovereign_workspace_owner" ON "sovereign_workspace" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_sovereign_workspace_status" ON "sovereign_workspace" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_workspace_access_log_workspace" ON "sovereign_workspace_access_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_workspace_access_log_user" ON "sovereign_workspace_access_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_workspace_access_log_action" ON "sovereign_workspace_access_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_workspace_access_log_created" ON "sovereign_workspace_access_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_workspace_deployment_project" ON "sovereign_workspace_deployments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_workspace_deployment_status" ON "sovereign_workspace_deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_workspace_deployment_environment" ON "sovereign_workspace_deployments" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "IDX_workspace_member_workspace" ON "sovereign_workspace_members" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_workspace_member_user" ON "sovereign_workspace_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_workspace_member_role" ON "sovereign_workspace_members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "IDX_workspace_project_workspace" ON "sovereign_workspace_projects" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_workspace_project_type" ON "sovereign_workspace_projects" USING btree ("platform_type");--> statement-breakpoint
CREATE INDEX "IDX_workspace_project_status" ON "sovereign_workspace_projects" USING btree ("deployment_status");--> statement-breakpoint
CREATE INDEX "IDX_workspace_project_code" ON "sovereign_workspace_projects" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_spom_audit_owner" ON "spom_audit_log" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_spom_audit_session" ON "spom_audit_log" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_spom_audit_operation" ON "spom_audit_log" USING btree ("operation_type");--> statement-breakpoint
CREATE INDEX "IDX_spom_audit_executed" ON "spom_audit_log" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "IDX_spom_op_code" ON "spom_operations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "IDX_spom_op_category" ON "spom_operations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_sshv_user" ON "ssh_vault" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_sshv_fingerprint" ON "ssh_vault" USING btree ("key_fingerprint");--> statement-breakpoint
CREATE INDEX "IDX_sshv_host" ON "ssh_vault" USING btree ("server_host");--> statement-breakpoint
CREATE INDEX "IDX_ssl_certificates_domain" ON "ssl_certificates" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "IDX_ssl_certificates_expires" ON "ssl_certificates" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "IDX_agent_user" ON "support_agents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_agent_status" ON "support_agents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_support_analytics_period" ON "support_analytics" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE INDEX "IDX_diagnostics_session" ON "support_diagnostics" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_diagnostics_type" ON "support_diagnostics" USING btree ("diagnostic_type");--> statement-breakpoint
CREATE INDEX "IDX_kb_category" ON "support_knowledge_base" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_kb_published" ON "support_knowledge_base" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "IDX_kb_slug" ON "support_knowledge_base" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "IDX_support_message_session" ON "support_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "IDX_support_message_sender" ON "support_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "IDX_support_message_created" ON "support_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_support_session_user" ON "support_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_support_session_agent" ON "support_sessions" USING btree ("assigned_agent_id");--> statement-breakpoint
CREATE INDEX "IDX_support_session_status" ON "support_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_support_session_priority" ON "support_sessions" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_support_session_channel" ON "support_sessions" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "IDX_support_session_created" ON "support_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_tc_task" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "IDX_tc_user" ON "task_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_trust_category" ON "trust_metrics" USING btree ("category");--> statement-breakpoint
CREATE INDEX "IDX_trust_measured" ON "trust_metrics" USING btree ("measured_at");--> statement-breakpoint
CREATE INDEX "IDX_ub_project" ON "unified_blueprints" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "IDX_ub_version" ON "unified_blueprints" USING btree ("version");--> statement-breakpoint
CREATE INDEX "IDX_alerts_user" ON "usage_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_alerts_type" ON "usage_alerts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_alerts_read" ON "usage_alerts" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "IDX_location_user" ON "user_locations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_location_country" ON "user_locations" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "IDX_notification_pref_user" ON "user_notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_limits_user" ON "user_usage_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_vas_user" ON "vault_access_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_vas_token" ON "vault_access_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "IDX_vas_active" ON "vault_access_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_val_user" ON "vault_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_val_key" ON "vault_audit_log" USING btree ("key_id");--> statement-breakpoint
CREATE INDEX "IDX_val_action" ON "vault_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "IDX_val_created" ON "vault_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_webhook_deliveries_endpoint" ON "webhook_deliveries" USING btree ("endpoint_id");--> statement-breakpoint
CREATE INDEX "IDX_webhook_deliveries_status" ON "webhook_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_webhook_deliveries_created" ON "webhook_deliveries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_webhook_endpoints_tenant" ON "webhook_endpoints" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "IDX_webhook_endpoints_active" ON "webhook_endpoints" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_webhook_logs_event_id" ON "webhook_logs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "IDX_webhook_logs_event_type" ON "webhook_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "IDX_webhook_logs_processed" ON "webhook_logs" USING btree ("processed");--> statement-breakpoint
CREATE INDEX "IDX_webhook_logs_created" ON "webhook_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_whitelabel_license" ON "white_label_profiles" USING btree ("license_id");--> statement-breakpoint
CREATE INDEX "IDX_whitelabel_domain" ON "white_label_profiles" USING btree ("custom_domain");--> statement-breakpoint
CREATE INDEX "IDX_whitelabel_active" ON "white_label_profiles" USING btree ("is_active");