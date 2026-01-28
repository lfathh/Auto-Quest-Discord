export interface AllQuestsResponse {
	/**
	 * The current quests for the user
	 */
	quests: Quest[];
	/**
	 * The quests that the user cannot participate in
	 */
	excluded_quests: Partial<Quest>[];
	/**
	 * When the user can enroll in quests again
	 */
	quest_enrollment_blocked_until: string | null;
}

export type Snowflake = string;

export interface Quest {
	/**
	 * The ID of the quest
	 */
	id: Snowflake;
	/**
	 * The configuration and metadata for the quest
	 */
	config: QuestConfig;
	/**
	 * The user's quest progress, if it has been accepted
	 */
	user_status: QuestUserStatus | null;
	/**
	 * The content areas where the quest can be shown
	 * @deprecated
	 */
	targeted_content: number;
	/**
	 * Whether the quest is unreleased and in preview for Discord employees
	 */
	preview: boolean;
}

/**
 * The config structure has multiple distinct versions with different field sets. Only actively used versions are kept documented. As of now, only the latest version is available.
 */
export interface QuestConfig {
	/**
	 * The ID of the quest
	 */
	id: Snowflake;
	/**
	 * Quest configuration version
	 */
	config_version: number;
	/**
	 * When the quest period starts
	 */
	starts_at: string;
	/**
	 * When the quest period ends
	 */
	expires_at: string;
	/**
	 * The quest features enabled for the quest
	 */
	features: number;
	/**
	 * The application metadata for the quest
	 */
	application: QuestApplication;
	/**
	 * Object that holds the quest's assets
	 */
	assets: QuestAssets;
	/**
	 * The accent colors for the quest
	 */
	colors: QuestGradient;
	/**
	 * Human-readable metadata for the quest
	 */
	messages: QuestMessages;
	/**
	 * The task configuration for the quest
	 */
	task_config: QuestTaskConfig;
	/**
	 * Specifies rewards for the quest (e.g. collectibles)
	 */
	rewards_config: QuestRewardsConfig;
	/**
	 * The configuration for the video quest
	 */
	video_metadata?: QuestVideoMetadata;
	/**
	 * The configuration for the quest co-sponsor
	 */
	cosponsor_metadata?: QuestCosponsorMetadata;
}

export interface QuestUserStatus {
	/**
	 * The ID of the user
	 */
	user_id: Snowflake;
	/**
	 * The ID of the quest
	 */
	quest_id?: Snowflake;
	/**
	 * When the user accepted the quest
	 */
	enrolled_at: string | null;
	/**
	 * When the user completed the quest
	 */
	completed_at: string | null;
	/**
	 * When the user claimed the quest's reward
	 */
	claimed_at: string | null;
	/**
	 * Which reward tier the user has claimed, if the quest's assignment_method is TIERED
	 */
	claimed_tier?: number | null;
	/**
	 * When the last heartbeat was received
	 */
	last_stream_heartbeat_at?: string | null;
	/**
	 * Duration (in seconds) the user has streamed the game for since the quest was accepted
	 */
	stream_progress_seconds?: string;
	/**
	 * The content areas the user has dismissed for the quest
	 */
	dismissed_quest_content?: number;
	/**
	 * The user's progress for each task in the quest, keyed by their event name
	 */
	progress: Record<string, QuestTaskProgress>;
}

export interface QuestTaskProgress {
	/**
	 * The type of task event
	 */
	event_name: string;
	/**
	 * The current task value
	 */
	value: number;
	/**
	 * When the task was last updated
	 */
	updated_at: string;
	/**
	 * When the task was completed
	 */
	completed_at: string | null;
	/**
	 * The task's heartbeat data
	 */
	heartbeat?: QuestTaskHeartbeat | null;
}

export interface QuestTaskHeartbeat {
	/**
	 * When the last heartbeat was received
	 */
	last_beat_at: string;
	/**
	 * When the task progress expires
	 */
	expires_at: string | null;
}

export interface QuestApplication {
	/**
	 * The ID of the application
	 */
	id: Snowflake;
	/**
	 * The name of the application
	 */
	name: string;
	/**
	 * The link to the game's page
	 */
	link: string;
}

/**
 * An object holding [CDN asset names](https://docs.discord.food/reference#cdn-formatting).
 */
export interface QuestAssets {
	/**
	 * The quest's hero image
	 */
	hero: string;
	/**
	 * A video representation of the hero image
	 */
	hero_video: string | null;
	/**
	 * The hero image used in the quest popup that appears when launching the game before accepting the quest
	 */
	quest_bar_hero: string;
	/**
	 * A video representation of the quest bar hero image
	 */
	quest_bar_hero_video: string | null;
	/**
	 * The game's icon
	 */
	game_tile: string;
	/**
	 * The game's logo
	 */
	logotype: string;
}

/**
 * A 2-point gradient with a primary and secondary color.
 */
export interface QuestGradient {
	/**
	 * The hex-encoded primary color of the gradient
	 */
	primary: string;
	/**
	 * The hex-encoded secondary color of the gradient
	 */
	secondary: string;
}

export interface QuestMessages {
	/**
	 * The name of the quest
	 */
	quest_name: string;
	/**
	 * The title of the game the quest is for
	 */
	game_title: string;
	/**
	 * The publisher of the game the quest is for
	 */
	game_publisher: string;
}

export enum QuestTaskConfigType {
	WATCH_VIDEO = 'WATCH_VIDEO',
	PLAY_ON_DESKTOP = 'PLAY_ON_DESKTOP',
	STREAM_ON_DESKTOP = 'STREAM_ON_DESKTOP',
	PLAY_ACTIVITY = 'PLAY_ACTIVITY',
	WATCH_VIDEO_ON_MOBILE = 'WATCH_VIDEO_ON_MOBILE',
}

export interface QuestTaskConfig {
	/**
	 * The type of task configuration
	 */
	type: number;
	/**
	 * The eligibility operator used to join multiple tasks ( and or or )
	 */
	join_operator: string;
	/**
	 * Tasks required to complete the quest, keyed by their event name
	 */
	tasks: Record<QuestTaskConfigType, QuestTask>;
	/**
	 * A link to the third-party quest tasks enrollment page
	 */
	enrollment_url?: string;
	/**
	 * The ID of the embedded activity for the third-party task
	 */
	developer_application_id?: Snowflake;
}

export interface QuestTask {
	/**
	 * The type of task event
	 */
	event_name: string;
	/**
	 * The required value
	 */
	target: number;
	/**
	 * IDs of the target game on console platforms
	 */
	external_ids?: string[];
	/**
	 * The third-party task title
	 */
	title?: string;
	/**
	 * The third-party task description
	 */
	description?: string;
}

export interface QuestRewardsConfig {
	/**
	 * How the rewards are assigned
	 */
	assignment_method: number;
	/**
	 * The possible rewards for the quest, ordered by tier (if applicable)
	 */
	rewards: QuestReward[];
	/**
	 * When the reward claiming period ends
	 */
	rewards_expire_at: string | null;
	/**
	 * The platforms the rewards can be redeemed on
	 */
	platforms: number;
}

export interface QuestReward {
	/**
	 * The reward's type
	 */
	type: number;
	/**
	 * The ID of the SKU awarded
	 */
	sku_id: Snowflake;
	/**
	 * The reward's media asset
	 */
	asset?: string | null;
	/**
	 * The reward's video asset
	 */
	asset_video?: string | null;
	/**
	 * Human-readable metadata for the reward
	 */
	messages: QuestRewardMessages;
	/**
	 * An approximate count of how many users can claim the reward
	 */
	approximate_count?: number | null;
	/**
	 * The link to redeem the reward
	 */
	redemption_link?: string | null;
	/**
	 * When the reward expires
	 */
	expires_at?: string | null;
	/**
	 * When the reward expires for premium users
	 */
	expires_at_premium?: string | null;
	/**
	 * The expiration mode
	 */
	expiration_mode?: number;
	/**
	 * The amount of Discord Orbs awarded
	 */
	orb_quantity?: number;
	/**
	 * The days of fractional premium awarded
	 */
	quantity?: number;
}

export interface QuestRewardMessages {
	/**
	 * The reward's name
	 */
	name: string;
	/**
	 * The article variant of the name (e.g. a Cybernetic Headgear Decoration)
	 */
	name_with_article: string;
	/**
	 * The instrutions on redeeming the reward per-platform
	 */
	reward_redemption_instructions_by_platform?: Record<number, string>;
}

export interface QuestVideoMetadata {
	/**
	 * Human-readable metadata for the video quest
	 */
	messages: QuestVideoMessages;
	/**
	 * Object that holds the quest's video assets
	 */
	assets: QuestVideoAssets;
}

export interface QuestVideoAssets {
	/**
	 * The HLS video asset for the video player
	 */
	video_player_video_hls: string | null;
	/**
	 * The video asset for the video player
	 */
	video_player_video: string;
	/**
	 * The thumbnail asset for the video player
	 */
	video_player_thumbnail: string | null;
	/**
	 * The low-resolution video asset for the video player
	 */
	video_player_video_low_res: string;
	/**
	 * The caption asset for the video player
	 */
	video_player_caption: string;
	/**
	 * The transcript asset for the video player
	 */
	video_player_transcript: string;
	/**
	 * The video asset for the quest bar preview
	 */
	quest_bar_preview_video: string | null;
	/**
	 * The thumbnail asset for the quest bar preview
	 */
	quest_bar_preview_thumbnail: string | null;
	/**
	 * The video asset for the quest home page
	 */
	quest_home_video: string | null;
}

export interface QuestVideoMessages {
	/**
	 * The title of the video
	 */
	video_title: string;
	/**
	 * The title of the call-to-action at the end of the video
	 */
	video_end_cta_title: string;
	/**
	 * The subtitle of the call-to-action at the end of the video
	 */
	video_end_cta_subtitle: string;
	/**
	 * The label of the call-to-action button at the end of the video
	 */
	video_end_cta_button_label: string;
}

export interface QuestCosponsorMetadata {
	/**
	 * The name of the co-sponsor
	 */
	name: string;
	/**
	 * The co-sponsor's logo asset
	 */
	logotype: string;
	/**
	 * The co-sponsor's redemption instructions
	 */
	redemption_instructions: string;
}
