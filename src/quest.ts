import type {
	Quest as QuestShape,
} from './interface';

export class Quest {
	private readonly data: QuestShape;

	private constructor(data: QuestShape) {
		this.data = data;
	}

	static create(data: QuestShape): Quest {
		return new Quest(data);
	}

	get id() {
		return this.data.id;
	}

	get config() {
		return this.data.config;
	}

	get userStatus(){
		return this.data.user_status;
	}

	get targetedContent() {
		return this.data.targeted_content;
	}

	get preview(): boolean {
		return this.data.preview;
	}

	isExpired(reference: Date = new Date()): boolean {
		return reference.getTime() > new Date(this.data.config.expires_at).getTime();
	}

	isCompleted(): boolean {
		return Boolean(this.userStatus?.completed_at);
	}

    isEnrolledQuest(): boolean {
        return Boolean(this.userStatus?.enrolled_at);
    }

	hasClaimedRewards(): boolean {
		return Boolean(this.userStatus?.claimed_at);
	}

    updateUserStatus(userStatus: QuestShape["user_status"]) {
        this.data.user_status = userStatus;
    }
}
