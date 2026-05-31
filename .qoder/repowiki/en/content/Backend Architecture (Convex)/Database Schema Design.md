# Database Schema Design

<cite>
**Referenced Files in This Document**
- [schema.ts](file://convex/schema.ts)
- [users.ts](file://convex/users.ts)
- [creators.ts](file://convex/creators.ts)
- [stories.ts](file://convex/stories.ts)
- [interactions.ts](file://convex/interactions.ts)
- [payments.ts](file://convex/payments.ts)
- [ads.ts](file://convex/ads.ts)
- [gamification.ts](file://convex/gamification.ts)
- [admin.ts](file://convex/admin.ts)
- [applications.ts](file://convex/applications.ts)
- [settings.ts](file://convex/settings.ts)
- [files.ts](file://convex/files.ts)
- [migrate.ts](file://convex/migrate.ts)
- [seed.ts](file://convex/seed.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive database schema documentation for the Lemonade platform built on Convex. The schema defines 493 lines of table definitions, relationships, and indexing strategies that support user roles, content management, monetization, gamification, advertising, and administrative workflows. It covers entity relationships, table structures, validation rules, indexing strategies for performance, and real-time capabilities.

## Project Structure
The Convex schema organizes data into cohesive tables grouped by functional domains:
- Identity and Access Control: users, moderators, adminActivity
- Creator Ecosystem: creators, creatorApplications
- Content Management: stories, comments, readingHistory, notifications
- Monetization: walletTransactions, platformSettings
- Advertising: advertisers, adCampaigns, adEvents, creatorAdRevenue
- Gamification: userCurrencies, userStreaks, weeklySpinInventory, spinResults, engagementEvents, xpEvents, achievementsCatalog, userAchievements, leaderboardsSnapshots, creatorQuests, rewardInventory
- Fraud Detection: fraudEvents

```mermaid
graph TB
subgraph "Identity & Access"
U["users"]
M["moderators"]
AA["adminActivity"]
end
subgraph "Creator Ecosystem"
C["creators"]
CA["creatorApplications"]
end
subgraph "Content Management"
S["stories"]
CM["comments"]
RH["readingHistory"]
N["notifications"]
end
subgraph "Monetization"
WT["walletTransactions"]
PS["platformSettings"]
end
subgraph "Advertising"
AD["advertisers"]
AC["adCampaigns"]
AE["adEvents"]
CAR["creatorAdRevenue"]
end
subgraph "Gamification"
UC["userCurrencies"]
US["userStreaks"]
WSI["weeklySpinInventory"]
SR["spinResults"]
EE["engagementEvents"]
XPE["xpEvents"]
ACAT["achievementsCatalog"]
UA["userAchievements"]
LB["leaderboardsSnapshots"]
CQ["creatorQuests"]
RI["rewardInventory"]
end
subgraph "Fraud"
FE["fraudEvents"]
end
U --- C
U --- WT
U --- RH
U --- N
C --- S
S --- CM
WT --- U
WT --- C
AE --- AC
AE --- C
CAR --- C
UC --- U
US --- U
WSI --- SR
EE --- U
XPE --- U
ACAT --- UA
LB --- U
CQ --- C
RI --- SR
FE --- U
```

**Diagram sources**
- [schema.ts:24-492](file://convex/schema.ts#L24-L492)

**Section sources**
- [schema.ts:1-493](file://convex/schema.ts#L1-L493)

## Core Components

### User Roles System
The schema defines four user roles with strict validation:
- guest: Basic access without privileges
- reader: Default authenticated user role
- creator: Content creator with elevated permissions
- admin: Platform administrator

Role transitions occur through administrative workflows and creator application approvals. The system enforces role-based access control across mutations and queries.

**Section sources**
- [schema.ts:4-9](file://convex/schema.ts#L4-L9)
- [users.ts:92-111](file://convex/users.ts#L92-L111)
- [applications.ts:120-223](file://convex/applications.ts#L120-L223)

### Premium Status Tracking
Premium subscriptions support three tiers with lifecycle management:
- free: Basic tier with limited features
- trial: Temporary premium access
- premium: Full premium subscription
- expired: Past-due premium status

Subscription plans include monthly and yearly billing cycles with provider integration (Paystack). The system tracks renewal dates, cancellation requests, and provider references.

**Section sources**
- [schema.ts:38-51](file://convex/schema.ts#L38-L51)
- [payments.ts:174-262](file://convex/payments.ts#L174-L262)

### Creator Application Workflows
The creator application process follows a structured approval pipeline:
- Pending submissions trigger user status updates
- Administrative review updates user roles and creates creator profiles
- Multi-field application form captures portfolio, categories, and content intent
- Enhanced application data includes social links, studio mode, and story readiness

**Section sources**
- [schema.ts:127-149](file://convex/schema.ts#L127-L149)
- [applications.ts:70-118](file://convex/applications.ts#L70-L118)
- [applications.ts:120-223](file://convex/applications.ts#L120-L223)

### Content Management Schema
Content management encompasses stories, chapters, media handling, and publishing workflows:
- Stories support multiple formats (Manga, Manhwa, Novel, Movie)
- Chapter-based unlocking with wallet transactions
- Rich media support through cover images, banners, and embedded content
- Publishing workflow with draft/published/hidden/archived states
- Tagging system for discoverability and filtering

**Section sources**
- [schema.ts:95-125](file://convex/schema.ts#L95-L125)
- [stories.ts:46-104](file://convex/stories.ts#L46-L104)
- [stories.ts:106-144](file://convex/stories.ts#L106-L144)

### Monetization System
The monetization system handles multiple revenue streams:
- Wallet transactions for top-ups, chapter unlocks, creator support, and premium purchases
- Payment processing with Paystack integration
- Revenue tracking for creator support payments
- Transaction lifecycle management (pending, success, failed, refunded)

**Section sources**
- [schema.ts:198-223](file://convex/schema.ts#L198-L223)
- [payments.ts:82-111](file://convex/payments.ts#L82-L111)
- [payments.ts:113-172](file://convex/payments.ts#L113-L172)

### Gamification System
Gamification encompasses XP events, streak tracking, achievement catalogs, and reward systems:
- Engagement-based XP awards with completion thresholds
- Streak protection system using Lemon Coins
- Weekly spin rewards with weighted probability
- Achievement catalog with XP and coin rewards
- Leaderboard snapshots for periodic rankings

**Section sources**
- [schema.ts:354-455](file://convex/schema.ts#L354-L455)
- [gamification.ts:14-117](file://convex/gamification.ts#L14-L117)
- [gamification.ts:147-232](file://convex/gamification.ts#L147-L232)

### Administrative Features
Administrative capabilities include content reporting, moderation tools, and platform settings:
- Content reporting system with automated resolution workflows
- Moderator management with role-based permissions
- Platform settings for maintenance and announcements
- Fraud detection and monitoring
- Analytics dashboards for revenue and user metrics

**Section sources**
- [schema.ts:151-181](file://convex/schema.ts#L151-L181)
- [admin.ts:179-223](file://convex/admin.ts#L179-L223)
- [admin.ts:246-250](file://convex/admin.ts#L246-L250)
- [settings.ts:4-44](file://convex/settings.ts#L4-L44)

## Architecture Overview

```mermaid
erDiagram
USERS {
string _id PK
string externalId
string firebaseUid
string email
string name
string username
string usernameUpdatedAt
string usernameChangeLockedAt
string bio
string avatar
string banner
enum role
enum creatorAccessStatus
enum premiumStatus
enum premiumPlan
enum premiumBillingCycle
string premiumStartedAt
string premiumRenewsAt
string premiumCancelledAt
boolean premiumCancelAtPeriodEnd
string premiumProvider
string premiumReference
number walletBalance
number xp
number level
array followedCreators
array savedStories
array unlockedChapters
array badges
any settings
enum status
string createdAt
string updatedAt
}
CREATORS {
string _id PK
string externalId
string userId
string name
string username
string avatar
number followers
string bio
any category
string location
number totalReads
number totalStories
string dropsomethingUrl
boolean supportEnabled
any profile
string createdAt
string updatedAt
}
STORIES {
string _id PK
string externalId
string creatorId
string creatorUsername
string title
string genre
string format
number rating
number views
number saves
number episodes
string synopsis
string coverImage
string bannerImage
array tags
boolean isOriginal
boolean isFeatured
enum status
any media
string createdAt
string updatedAt
}
COMMENTS {
string _id PK
string storyId
string chapterId
string parentCommentId
string authorId
string authorName
string authorAvatar
string message
number likesCount
array likedBy
string createdAt
string updatedAt
}
WALLET_TRANSACTIONS {
string _id PK
string userId
enum type
number amount
string currency
enum status
string reference
string provider
any providerPayload
any metadata
string createdAt
}
CONTENT_REPORTS {
string _id PK
enum type
string targetId
string targetName
string reportedBy
string reason
string message
enum status
string createdAt
string resolvedAt
string resolvedBy
}
ADMINS {
string _id PK
string name
string email
enum role
array permissions
enum status
string lastActive
string createdAt
string updatedAt
}
ADVERTISERS {
string _id PK
string name
string contactEmail
enum status
number budgetNaira
number spentNaira
string createdAt
string updatedAt
}
AD_CAMPAIGNS {
string _id PK
string advertiserId
string title
enum type
enum placement
enum status
string mediaUrl
string clickUrl
string brandName
string headline
string description
number cpmNaira
array targetGenres
number frequencyCapHours
number priority
string startsAt
string endsAt
string createdAt
string updatedAt
}
AD_EVENTS {
string _id PK
string adId
string advertiserId
string userId
string storyId
string creatorUsername
enum contentType
string chapterId
enum eventType
number watchTimeMs
number revenueNaira
number creatorShareNaira
number platformShareNaira
string createdAt
}
CREATOR_AD_REVENUE {
string _id PK
string creatorUsername
string storyId
string period
number impressions
number completedViews
number skips
number clicks
number watchTimeMs
number grossRevenueNaira
number creatorRevenueNaira
number platformRevenueNaira
string updatedAt
}
USER_CURRENCIES {
string _id PK
string userId
number lemonCoins
number goldenInk
string updatedAt
}
USER_STREAKS {
string _id PK
string userId
number currentStreak
string lastActiveAt
number longestStreak
string protectedUntil
number insuranceUses
string updatedAt
}
WEEKLY_SPIN_INVENTORY {
string _id PK
string rewardId
enum type
number amount
any metadata
number weight
boolean active
string createdAt
string updatedAt
}
SPIN_RESULTS {
string _id PK
string userId
string weekStart
string rewardId
string rewardType
any rewardValue
string awardedAt
string claimedAt
enum status
any metadata
}
ENGAGEMENT_EVENTS {
string _id PK
string userId
string sessionId
string storyId
string chapterId
enum contentType
number durationMs
number completionPct
number scrollCompletionPct
number sessionQuality
boolean returningVisit
boolean counted
string timestamp
any metadata
}
XP_EVENTS {
string _id PK
string userId
number amount
string reason
string source
string timestamp
any metadata
}
ACHIEVEMENTS_CATALOG {
string _id PK
string achievementId
string name
string description
any criteria
number xpReward
number coinReward
string badgeId
string icon
boolean active
string createdAt
string updatedAt
}
USER_ACHIEVEMENTS {
string _id PK
string userId
string achievementId
string awardedAt
any metadata
}
LEADERBOARDS_SNAPSHOTS {
string _id PK
string period
enum type
array entries
string createdAt
}
CREATOR_QUESTS {
string _id PK
string questId
string creatorId
string title
string description
any requirements
any rewards
string startsAt
string endsAt
boolean active
string createdAt
string updatedAt
}
REWARD_INVENTORY {
string _id PK
string rewardId
string provider
string type
number quantity
number reserved
any metadata
string updatedAt
}
FRAUD_EVENTS {
string _id PK
string userId
string type
string description
any evidence
number score
boolean resolved
string createdAt
string resolvedAt
string reviewedBy
}
PLATFORM_SETTINGS {
string _id PK
boolean showMockData
boolean maintenanceMode
string announcement
string updatedAt
}
READ_HISTORY {
string _id PK
string userId
string storyId
string chapterId
string timestamp
}
NOTIFICATIONS {
string _id PK
string userId
enum type
string title
string message
string timestamp
boolean read
string link
}
ADMIN_ACTIVITY {
string _id PK
string action
string adminEmail
string timestamp
any metadata
}
USERS ||--o{ CREATORS : "creator profile"
USERS ||--o{ WALLET_TRANSACTIONS : "user transactions"
USERS ||--o{ READ_HISTORY : "reading history"
USERS ||--o{ NOTIFICATIONS : "user notifications"
CREATORS ||--o{ STORIES : "author"
STORIES ||--o{ COMMENTS : "story comments"
AD_CAMPAIGNS ||--o{ AD_EVENTS : "ad events"
AD_CAMPAIGNS ||--o{ CREATOR_AD_REVENUE : "creator revenue"
CREATORS ||--o{ CREATOR_AD_REVENUE : "creator revenue"
USERS ||--o{ USER_CURRENCIES : "currency holdings"
USERS ||--o{ USER_STREAKS : "streak tracking"
USERS ||--o{ SPIN_RESULTS : "spin rewards"
USERS ||--o{ ENGAGEMENT_EVENTS : "engagement"
USERS ||--o{ XP_EVENTS : "XP events"
USERS ||--o{ USER_ACHIEVEMENTS : "achievements"
CREATORS ||--o{ CREATOR_QUESTS : "quests"
ADVERTISERS ||--o{ AD_CAMPAIGNS : "campaigns"
```

**Diagram sources**
- [schema.ts:24-492](file://convex/schema.ts#L24-L492)

## Detailed Component Analysis

### User Management System
The user management system provides comprehensive identity and access control:

```mermaid
sequenceDiagram
participant Auth as "Auth Provider"
participant Users as "Users Module"
participant DB as "Convex DB"
Auth->>Users : upsertFromAuth(firebaseUid, email, name, username)
Users->>DB : Query users by firebaseUid
DB-->>Users : Existing user or null
alt User exists
Users->>DB : Patch user fields
DB-->>Users : Updated user
else New user
Users->>DB : Insert new user with defaults
DB-->>Users : New user
end
Users-->>Auth : User ID
```

**Diagram sources**
- [users.ts:42-90](file://convex/users.ts#L42-L90)

Key validation rules include:
- Username normalization (trim, lowercase, remove @ prefix)
- Username format validation (3-24 characters, alphanumeric, underscore only)
- Username change intervals (90-day lockout)
- Email uniqueness enforcement
- Role-based access control

**Section sources**
- [users.ts:7-13](file://convex/users.ts#L7-L13)
- [users.ts:183-243](file://convex/users.ts#L183-L243)

### Content Creation and Publishing Workflow
Content creation follows a structured workflow with validation and publishing controls:

```mermaid
flowchart TD
Start([Content Creation]) --> Validate["Validate Story Fields"]
Validate --> Exists{"External ID Exists?"}
Exists --> |Yes| Error["Throw Duplicate Error"]
Exists --> |No| Clean["Clean Optional Fields"]
Clean --> Insert["Insert Story with Defaults"]
Insert --> Publish{"Publish Request?"}
Publish --> |Yes| SetPublished["Set Status to Published"]
Publish --> |No| Draft["Remain in Draft"]
SetPublished --> Complete([Complete])
Draft --> Complete
Error --> Complete
```

**Diagram sources**
- [stories.ts:46-104](file://convex/stories.ts#L46-L104)
- [stories.ts:163-179](file://convex/stories.ts#L163-L179)

**Section sources**
- [stories.ts:106-144](file://convex/stories.ts#L106-L144)

### Monetization and Payment Processing
Payment processing integrates with external providers and manages wallet transactions:

```mermaid
sequenceDiagram
participant Client as "Client"
participant Payments as "Payments Module"
participant Provider as "Paystack"
participant DB as "Convex DB"
Client->>Payments : creditWalletAfterPaystack(firebaseUid, coins, nairaAmount, reference)
Payments->>DB : Check duplicate reference
DB-->>Payments : Reference exists?
alt Reference exists
Payments-->>Client : Already credited
else New transaction
Payments->>DB : Update user wallet balance
Payments->>DB : Insert wallet transaction
DB-->>Payments : Success
Payments-->>Client : Credited
end
Client->>Payments : activatePremiumAfterPaystack(...)
Payments->>DB : Update user premium status
Payments->>DB : Insert premium transaction
```

**Diagram sources**
- [payments.ts:113-172](file://convex/payments.ts#L113-L172)
- [payments.ts:174-262](file://convex/payments.ts#L174-L262)

**Section sources**
- [payments.ts:21-80](file://convex/payments.ts#L21-L80)

### Advertising and Revenue Distribution
Advertising system handles campaign management and revenue sharing:

```mermaid
flowchart TD
Campaign["Ad Campaign Created"] --> Select["Content Gate Selection"]
Select --> Eligible{"Eligible for Display?"}
Eligible --> |No| Skip["Skip Ad"]
Eligible --> |Yes| Track["Track Ad Event"]
Track --> Calculate["Calculate Revenue"]
Calculate --> Split["Split Revenue (70%/30%)"]
Split --> UpdateCreator["Update Creator Revenue"]
Split --> UpdatePlatform["Update Platform Revenue"]
UpdateCreator --> Complete([Complete])
UpdatePlatform --> Complete
Skip --> Complete
```

**Diagram sources**
- [ads.ts:105-165](file://convex/ads.ts#L105-L165)
- [ads.ts:167-237](file://convex/ads.ts#L167-L237)

**Section sources**
- [ads.ts:239-273](file://convex/ads.ts#L239-L273)

### Gamification and Engagement System
Engagement tracking and gamification rewards user participation:

```mermaid
flowchart TD
Session["User Session"] --> Record["Record Engagement Event"]
Record --> Quality{"Session Quality?"}
Quality --> |High| Counted["Mark as Counted"]
Quality --> |Low| NotCounted["Skip Counting"]
Counted --> XP["Award XP Points"]
XP --> LevelUp{"Level Up?"}
LevelUp --> |Yes| UpdateLevel["Update User Level"]
LevelUp --> |No| Continue["Continue"]
UpdateLevel --> Coins["Award Lemon Coins"]
Continue --> Coins
Coins --> Streak["Update Streak Insurance"]
Streak --> Spin["Weekly Spin Eligibility"]
Spin --> Reward["Distribute Rewards"]
Reward --> Complete([Complete])
```

**Diagram sources**
- [gamification.ts:14-117](file://convex/gamification.ts#L14-L117)
- [gamification.ts:147-232](file://convex/gamification.ts#L147-L232)

**Section sources**
- [gamification.ts:234-287](file://convex/gamification.ts#L234-L287)

### Administrative Monitoring and Moderation
Administrative tools provide oversight and content management:

```mermaid
sequenceDiagram
participant Admin as "Admin"
participant Reports as "Reports Module"
participant Moderators as "Moderators Module"
participant DB as "Convex DB"
Admin->>Reports : List Reports
Reports->>DB : Query contentReports
DB-->>Reports : Report list
Admin->>Moderators : Manage Moderators
Moderators->>DB : CRUD operations
DB-->>Moderators : Operation results
Admin->>Reports : Resolve Report
Reports->>DB : Update report status
DB-->>Reports : Resolved
```

**Diagram sources**
- [admin.ts:179-223](file://convex/admin.ts#L179-L223)
- [admin.ts:246-250](file://convex/admin.ts#L246-L250)

**Section sources**
- [admin.ts:312-348](file://convex/admin.ts#L312-L348)

## Dependency Analysis

```mermaid
graph TB
subgraph "Core Dependencies"
SCHEMA["schema.ts"]
USERS["users.ts"]
CREATORS["creators.ts"]
STORIES["stories.ts"]
INTERACTIONS["interactions.ts"]
end
subgraph "Monetization"
PAYMENTS["payments.ts"]
ADS["ads.ts"]
end
subgraph "Gamification"
GAMIFICATION["gamification.ts"]
end
subgraph "Administration"
ADMIN["admin.ts"]
APPLICATIONS["applications.ts"]
end
subgraph "Infrastructure"
SETTINGS["settings.ts"]
FILES["files.ts"]
MIGRATE["migrate.ts"]
SEED["seed.ts"]
end
SCHEMA --> USERS
SCHEMA --> CREATORS
SCHEMA --> STORIES
SCHEMA --> INTERACTIONS
SCHEMA --> PAYMENTS
SCHEMA --> ADS
SCHEMA --> GAMIFICATION
SCHEMA --> ADMIN
SCHEMA --> APPLICATIONS
SCHEMA --> SETTINGS
SCHEMA --> FILES
SCHEMA --> MIGRATE
SCHEMA --> SEED
USERS --> PAYMENTS
CREATORS --> STORIES
STORIES --> INTERACTIONS
PAYMENTS --> ADS
GAMIFICATION --> USERS
ADMIN --> APPLICATIONS
```

**Diagram sources**
- [schema.ts:1-493](file://convex/schema.ts#L1-L493)

**Section sources**
- [schema.ts:24-492](file://convex/schema.ts#L24-L492)

## Performance Considerations

### Indexing Strategies
The schema implements strategic indexing for optimal query performance:

**Primary Indexes:**
- `by_firebaseUid`: Fast user lookups by authentication provider
- `by_username`: Efficient username-based operations
- `by_externalId`: Cross-system identifier resolution
- `by_userId`: Creator profile association
- `by_status`: Content filtering by publication state
- `by_creatorUsername`: Creator-centric queries

**Composite Indexes:**
- `by_user_story`: Reading history aggregation
- `by_creator_and_period`: Revenue period analysis
- `by_status_and_placement`: Ad campaign filtering

**Performance Optimizations:**
- Denormalized fields (creatorUsername) reduce join complexity
- Array fields for collections enable efficient bulk operations
- Timestamp-based queries support analytics and reporting

### Concurrency and Real-time Capabilities
Convex provides inherent concurrency safety through:
- Optimistic concurrency control with automatic conflict resolution
- Atomic mutations that maintain data consistency
- Real-time subscriptions for live data updates
- Conflict-free replicated data types for collaborative features

**Section sources**
- [schema.ts:63-67](file://convex/schema.ts#L63-L67)
- [schema.ts:91-93](file://convex/schema.ts#L91-L93)
- [schema.ts:121-125](file://convex/schema.ts#L121-L125)

## Troubleshooting Guide

### Common Issues and Solutions

**User Registration Problems:**
- Username conflicts: Implement proper validation before insertion
- Authentication failures: Verify firebaseUid uniqueness
- Role assignment errors: Check administrative permissions

**Content Publishing Issues:**
- Duplicate external IDs: Use create vs update logic appropriately
- Media upload failures: Validate storage URLs before saving
- Category field corruption: Run migration script

**Payment Processing Errors:**
- Duplicate reference handling: Check transaction existence before processing
- Premium activation failures: Validate user existence and reference uniqueness
- Wallet balance discrepancies: Reconcile transaction records

**Gamification System Issues:**
- XP calculation inconsistencies: Verify engagement event quality thresholds
- Streak protection failures: Check Lemon Coins balance and insurance usage
- Spin reward distribution: Validate weighted probability calculations

**Section sources**
- [migrate.ts:7-35](file://convex/migrate.ts#L7-L35)
- [seed.ts:209-252](file://convex/seed.ts#L209-L252)

### Data Validation Approaches
The schema employs multiple validation layers:
- Runtime validation through Convex values library
- Business logic validation in mutation handlers
- Index-based uniqueness enforcement
- Enum-based state validation
- Foreign key constraint simulation through ID references

**Section sources**
- [users.ts:9-13](file://convex/users.ts#L9-L13)
- [stories.ts:69-71](file://convex/stories.ts#L69-L71)

## Conclusion
The Lemonade database schema demonstrates comprehensive design for a modern digital content platform. With 493 lines of carefully crafted table definitions, the schema supports complex workflows including user management, content creation, monetization, advertising, gamification, and administration. The strategic indexing, validation rules, and real-time capabilities provide a solid foundation for scalable growth while maintaining data integrity and user experience.

The modular architecture enables feature development without schema disruption, while the comprehensive indexing strategy ensures optimal query performance across all functional domains. The gamification and monetization systems are particularly sophisticated, supporting engagement-driven revenue models with robust analytics and reporting capabilities.