# Story Editing and Publishing

<cite>
**Referenced Files in This Document**
- [schema.ts](file://convex/schema.ts)
- [stories.ts](file://convex/stories.ts)
- [UploadFlow.tsx](file://src/screens/UploadFlow.tsx)
- [CreatorStoryEditor.tsx](file://src/screens/CreatorStoryEditor.tsx)
- [CreatorDashboard.tsx](file://src/screens/CreatorDashboard.tsx)
- [AdminStories.tsx](file://src/screens/admin/AdminStories.tsx)
- [AdminStoryDetail.tsx](file://src/screens/admin/details/AdminStoryDetail.tsx)
- [admin.ts](file://convex/admin.ts)
- [api.d.ts](file://convex/_generated/api.d.ts)
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
10. [Appendices](#appendices)

## Introduction
This document explains the end-to-end story editing and publishing workflow in the Lemonade platform. It covers how creators draft, edit, and publish stories; how status transitions occur; validation and constraints; the modification interface; status management (draft, published, hidden, archived); automatic timestamps and audit logging; revision history and version control; dashboard integration for status and analytics; and publishing triggers and moderation workflows.

## Project Structure
The story lifecycle spans frontend screens and backend Convex modules:
- Frontend screens for creators and admins
- Backend Convex schema defining story data model and indexes
- Backend Convex mutations and queries for CRUD, publishing, and analytics

```mermaid
graph TB
subgraph "Frontend Screens"
UF["UploadFlow.tsx"]
CSE["CreatorStoryEditor.tsx"]
CD["CreatorDashboard.tsx"]
AS["AdminStories.tsx"]
ASD["AdminStoryDetail.tsx"]
end
subgraph "Convex Backend"
SCH["schema.ts"]
STORIES["stories.ts"]
ADMIN["admin.ts"]
API["api.d.ts"]
end
UF --> STORIES
CSE --> STORIES
CD --> STORIES
AS --> ADMIN
ASD --> ADMIN
STORIES --> SCH
ADMIN --> SCH
API --> STORIES
API --> ADMIN
```

**Diagram sources**
- [UploadFlow.tsx:1-511](file://src/screens/UploadFlow.tsx#L1-L511)
- [CreatorStoryEditor.tsx:1-635](file://src/screens/CreatorStoryEditor.tsx#L1-L635)
- [CreatorDashboard.tsx:1-322](file://src/screens/CreatorDashboard.tsx#L1-L322)
- [AdminStories.tsx:1-250](file://src/screens/admin/AdminStories.tsx#L1-L250)
- [AdminStoryDetail.tsx:1-304](file://src/screens/admin/details/AdminStoryDetail.tsx#L1-L304)
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)
- [stories.ts:1-180](file://convex/stories.ts#L1-L180)
- [admin.ts:31-64](file://convex/admin.ts#L31-L64)
- [api.d.ts:33-62](file://convex/_generated/api.d.ts#L33-L62)

**Section sources**
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)
- [stories.ts:1-180](file://convex/stories.ts#L1-L180)
- [UploadFlow.tsx:1-511](file://src/screens/UploadFlow.tsx#L1-L511)
- [CreatorStoryEditor.tsx:1-635](file://src/screens/CreatorStoryEditor.tsx#L1-L635)
- [CreatorDashboard.tsx:1-322](file://src/screens/CreatorDashboard.tsx#L1-L322)
- [AdminStories.tsx:1-250](file://src/screens/admin/AdminStories.tsx#L1-L250)
- [AdminStoryDetail.tsx:1-304](file://src/screens/admin/details/AdminStoryDetail.tsx#L1-L304)
- [admin.ts:31-64](file://convex/admin.ts#L31-L64)
- [api.d.ts:33-62](file://convex/_generated/api.d.ts#L33-L62)

## Core Components
- Story data model and indexes define status, metadata, and media fields.
- Convex mutations provide create, update, publish, and view increment operations.
- Frontend screens orchestrate the editing and publishing UX, enforce validation, and trigger backend mutations.
- Admin screens expose moderation controls and analytics.

Key backend functions:
- Create story with defaults and initial status.
- Selective update supporting metadata, content, media, and status.
- Publish mutation enforcing non-published state.
- Increment views mutation.
- Queries for listing published, featured, and creator-owned stories.

**Section sources**
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)
- [stories.ts:46-180](file://convex/stories.ts#L46-L180)

## Architecture Overview
The workflow integrates frontend UI actions with backend Convex functions and schema-defined constraints.

```mermaid
sequenceDiagram
participant Creator as "Creator UI"
participant Convex as "Convex Stories Module"
participant Schema as "Convex Schema"
Creator->>Convex : "Create story"
Convex->>Schema : "Insert story with defaults"
Schema-->>Convex : "Stored story (status=draft)"
Convex-->>Creator : "Story created"
Creator->>Convex : "Update story (selective fields)"
Convex->>Schema : "Patch story (updatedAt updated)"
Schema-->>Convex : "Updated record"
Convex-->>Creator : "Update result"
Creator->>Convex : "Publish story"
Convex->>Schema : "Patch status=published"
Schema-->>Convex : "Published record"
Convex-->>Creator : "Publish result"
```

**Diagram sources**
- [stories.ts:46-180](file://convex/stories.ts#L46-L180)
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)

## Detailed Component Analysis

### Story Data Model and Status Management
- Fields include title, genre, format, synopsis, images, tags, originality flag, featured flag, episodes, views, saves, rating, media, and timestamps.
- Status supports draft, published, hidden, archived.
- Indexes enable efficient queries by status, creator, and external identifiers.

```mermaid
erDiagram
STORIES {
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
string[] tags
boolean isOriginal
boolean isFeatured
enum status
any media
string createdAt
string updatedAt
}
```

**Diagram sources**
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)

**Section sources**
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)

### Story Creation and Validation
- Create mutation initializes defaults, filters empty images, and sets timestamps.
- Validation ensures creator identity and prevents duplicate external IDs.
- Upload flow enforces publishing prerequisites: title, visuals, and content presence.

```mermaid
flowchart TD
Start(["Create Story"]) --> CheckInputs["Validate inputs<br/>- Title present<br/>- Images and content meet requirements"]
CheckInputs --> Valid{"Valid?"}
Valid --> |No| ShowError["Show validation error"]
Valid --> |Yes| Insert["Insert story with defaults<br/>status=draft, timestamps"]
Insert --> Done(["Created"])
ShowError --> Done
```

**Diagram sources**
- [stories.ts:46-104](file://convex/stories.ts#L46-L104)
- [UploadFlow.tsx:180-278](file://src/screens/UploadFlow.tsx#L180-L278)

**Section sources**
- [stories.ts:46-104](file://convex/stories.ts#L46-L104)
- [UploadFlow.tsx:180-278](file://src/screens/UploadFlow.tsx#L180-L278)

### Story Update Mutation and Selective Field Updates
- Update mutation accepts optional fields and patches only provided keys.
- Always updates updatedAt to track revisions.
- Supports metadata, content, media, and status transitions.

```mermaid
flowchart TD
UStart(["Update Story"]) --> Load["Load existing story by externalId"]
Load --> Exists{"Exists?"}
Exists --> |No| NullReturn["Return null"]
Exists --> |Yes| BuildUpdates["Build updates from args<br/>omit externalId"]
BuildUpdates --> Patch["Patch story<br/>updatedAt=new timestamp"]
Patch --> UDone(["Updated"])
NullReturn --> UDone
```

**Diagram sources**
- [stories.ts:106-144](file://convex/stories.ts#L106-L144)

**Section sources**
- [stories.ts:106-144](file://convex/stories.ts#L106-L144)

### Publishing Workflow and Triggers
- Publish mutation checks existence and non-published state, then sets status to published and updates timestamps.
- Upload flow can publish directly with review status and instant publish flags stored in media metadata.
- Admin moderation toggles status visibility post-publication.

```mermaid
sequenceDiagram
participant Creator as "Creator UI"
participant Convex as "Convex Stories"
participant Admin as "Admin UI"
Creator->>Convex : "Publish story"
Convex->>Convex : "Check story exists and status != published"
Convex-->>Creator : "Set status=published, updatedAt"
Admin->>Admin : "Review content"
Admin->>Convex : "Toggle status (hidden/published)"
Convex-->>Admin : "Updated status"
```

**Diagram sources**
- [stories.ts:163-179](file://convex/stories.ts#L163-L179)
- [UploadFlow.tsx:240-242](file://src/screens/UploadFlow.tsx#L240-L242)
- [AdminStoryDetail.tsx:51-57](file://src/screens/admin/details/AdminStoryDetail.tsx#L51-L57)

**Section sources**
- [stories.ts:163-179](file://convex/stories.ts#L163-L179)
- [UploadFlow.tsx:240-242](file://src/screens/UploadFlow.tsx#L240-L242)
- [AdminStoryDetail.tsx:51-57](file://src/screens/admin/details/AdminStoryDetail.tsx#L51-L57)

### Creator Story Editor Interface
- Loads story by externalId, hydrates form state, and manages images, chapters, and attachments.
- Supports adding/removing chapters, attaching files, and saving selective updates.
- Provides archive and publish actions constrained by current status.

```mermaid
flowchart TD
Load["Load story by externalId"] --> Hydrate["Hydrate form state<br/>metadata, chapters, attachments"]
Hydrate --> Edit["Creator edits fields"]
Edit --> Save["Save selective updates<br/>upload assets, patch story"]
Save --> View["View live story link"]
Edit --> Publish["Publish (if draft)"]
Publish --> Updated["Status updated to published"]
```

**Diagram sources**
- [CreatorStoryEditor.tsx:84-133](file://src/screens/CreatorStoryEditor.tsx#L84-L133)
- [CreatorStoryEditor.tsx:213-259](file://src/screens/CreatorStoryEditor.tsx#L213-L259)
- [CreatorStoryEditor.tsx:296-318](file://src/screens/CreatorStoryEditor.tsx#L296-L318)

**Section sources**
- [CreatorStoryEditor.tsx:84-133](file://src/screens/CreatorStoryEditor.tsx#L84-L133)
- [CreatorStoryEditor.tsx:213-259](file://src/screens/CreatorStoryEditor.tsx#L213-L259)
- [CreatorStoryEditor.tsx:296-318](file://src/screens/CreatorStoryEditor.tsx#L296-L318)

### Dashboard Integration and Analytics
- Creator dashboard aggregates stats (reads, followers, active stories, ad earnings) and lists stories with quick links.
- Admin stories page displays stories, filters, and moderation actions; detail page shows metrics and logs.

```mermaid
graph LR
CD["CreatorDashboard.tsx"] --> Stories["Stories query"]
Stories --> Stats["Computed stats"]
AS["AdminStories.tsx"] --> Filters["Search and filter"]
ASD["AdminStoryDetail.tsx"] --> Metrics["Engagement and admin logs"]
```

**Diagram sources**
- [CreatorDashboard.tsx:92-106](file://src/screens/CreatorDashboard.tsx#L92-L106)
- [AdminStories.tsx:30-40](file://src/screens/admin/AdminStories.tsx#L30-L40)
- [AdminStoryDetail.tsx:146-177](file://src/screens/admin/details/AdminStoryDetail.tsx#L146-L177)

**Section sources**
- [CreatorDashboard.tsx:92-106](file://src/screens/CreatorDashboard.tsx#L92-L106)
- [AdminStories.tsx:30-40](file://src/screens/admin/AdminStories.tsx#L30-L40)
- [AdminStoryDetail.tsx:146-177](file://src/screens/admin/details/AdminStoryDetail.tsx#L146-L177)

### Status Management Matrix
- draft: editable by creator; not publicly visible; can be published or archived.
- published: visible to readers; can be hidden by admin; increments views.
- hidden: not visible to readers; can be restored to published.
- archived: removed from active listings; can be restored.

```mermaid
stateDiagram-v2
[*] --> Draft
Draft --> Published : "publish"
Draft --> Archived : "archive"
Published --> Hidden : "admin hide"
Hidden --> Published : "admin restore"
Published --> Archived : "archive"
Archived --> Draft : "restore (mock in UI)"
```

**Diagram sources**
- [schema.ts:112-117](file://convex/schema.ts#L112-L117)
- [CreatorStoryEditor.tsx:276-294](file://src/screens/CreatorStoryEditor.tsx#L276-L294)
- [AdminStoryDetail.tsx:51-57](file://src/screens/admin/details/AdminStoryDetail.tsx#L51-L57)

**Section sources**
- [schema.ts:112-117](file://convex/schema.ts#L112-L117)
- [CreatorStoryEditor.tsx:276-294](file://src/screens/CreatorStoryEditor.tsx#L276-L294)
- [AdminStoryDetail.tsx:51-57](file://src/screens/admin/details/AdminStoryDetail.tsx#L51-L57)

### Automatic Timestamps and Audit Trail
- Backend mutations set createdAt and updatedAt consistently.
- Admin module provides activity logging and analytics queries for monitoring.

```mermaid
sequenceDiagram
participant UI as "UI"
participant Stories as "Stories Module"
participant Admin as "Admin Module"
UI->>Stories : "Create/Update/Publish"
Stories->>Stories : "Set timestamps"
UI->>Admin : "Log activity"
Admin->>Admin : "Store adminActivity"
```

**Diagram sources**
- [stories.ts:73-101](file://convex/stories.ts#L73-L101)
- [stories.ts:138-141](file://convex/stories.ts#L138-L141)
- [stories.ts:155-158](file://convex/stories.ts#L155-L158)
- [admin.ts:232-244](file://convex/admin.ts#L232-L244)

**Section sources**
- [stories.ts:73-101](file://convex/stories.ts#L73-L101)
- [stories.ts:138-141](file://convex/stories.ts#L138-L141)
- [stories.ts:155-158](file://convex/stories.ts#L155-L158)
- [admin.ts:232-244](file://convex/admin.ts#L232-L244)

### Revision History and Version Control
- updatedAt is updated on every selective update, enabling chronological ordering of edits.
- Media metadata can capture review status and publish flags for workflow tracking.

```mermaid
flowchart TD
Edit["Selective update"] --> Touch["Patch updatedAt"]
Touch --> History["Order edits by updatedAt"]
History --> Review["Track reviewStatus and publishedInstantly"]
```

**Diagram sources**
- [stories.ts:138-141](file://convex/stories.ts#L138-L141)
- [UploadFlow.tsx:240-242](file://src/screens/UploadFlow.tsx#L240-L242)

**Section sources**
- [stories.ts:138-141](file://convex/stories.ts#L138-L141)
- [UploadFlow.tsx:240-242](file://src/screens/UploadFlow.tsx#L240-L242)

### Publishing Triggers and Approval Processes
- Instant publish: UploadFlow sets media.reviewStatus and publishedInstantly flags during create/update.
- Post-publication moderation: Admin toggles status and records activity.

```mermaid
sequenceDiagram
participant Creator as "Creator"
participant UploadFlow as "UploadFlow"
participant Stories as "Stories Module"
participant Admin as "Admin"
Creator->>UploadFlow : "Publish"
UploadFlow->>Stories : "Create/Update with reviewStatus and publishedInstantly"
Stories-->>Creator : "Published"
Admin->>Admin : "Review content"
Admin->>Stories : "Toggle status"
Stories-->>Admin : "Updated"
```

**Diagram sources**
- [UploadFlow.tsx:240-242](file://src/screens/UploadFlow.tsx#L240-L242)
- [stories.ts:163-179](file://convex/stories.ts#L163-L179)
- [AdminStoryDetail.tsx:51-57](file://src/screens/admin/details/AdminStoryDetail.tsx#L51-L57)

**Section sources**
- [UploadFlow.tsx:240-242](file://src/screens/UploadFlow.tsx#L240-L242)
- [stories.ts:163-179](file://convex/stories.ts#L163-L179)
- [AdminStoryDetail.tsx:51-57](file://src/screens/admin/details/AdminStoryDetail.tsx#L51-L57)

### Common Editing Scenarios and Workflows
- Draft to published:
  - Ensure title, cover, banner, and content are present.
  - Save as draft, then publish from editor.
- Update metadata and content:
  - Use selective update to change title, genre, synopsis, tags, and media.
- Archive or unpublish:
  - Archive removes from active listings; restore via admin toggle.

**Section sources**
- [UploadFlow.tsx:189-209](file://src/screens/UploadFlow.tsx#L189-L209)
- [CreatorStoryEditor.tsx:296-318](file://src/screens/CreatorStoryEditor.tsx#L296-L318)
- [CreatorStoryEditor.tsx:276-294](file://src/screens/CreatorStoryEditor.tsx#L276-L294)

## Dependency Analysis
- Frontend screens depend on Convex-generated API references.
- Stories module depends on schema indexes for efficient queries.
- Admin screens rely on analytics and moderation utilities.

```mermaid
graph TB
API["api.d.ts"] --> STORIES["stories.ts"]
API --> ADMIN["admin.ts"]
STORIES --> SCHEMA["schema.ts"]
ADMIN --> SCHEMA
UF["UploadFlow.tsx"] --> STORIES
CSE["CreatorStoryEditor.tsx"] --> STORIES
CD["CreatorDashboard.tsx"] --> STORIES
AS["AdminStories.tsx"] --> ADMIN
ASD["AdminStoryDetail.tsx"] --> ADMIN
```

**Diagram sources**
- [api.d.ts:33-62](file://convex/_generated/api.d.ts#L33-L62)
- [stories.ts:1-180](file://convex/stories.ts#L1-L180)
- [admin.ts:31-64](file://convex/admin.ts#L31-L64)
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)
- [UploadFlow.tsx:1-511](file://src/screens/UploadFlow.tsx#L1-L511)
- [CreatorStoryEditor.tsx:1-635](file://src/screens/CreatorStoryEditor.tsx#L1-L635)
- [CreatorDashboard.tsx:1-322](file://src/screens/CreatorDashboard.tsx#L1-L322)
- [AdminStories.tsx:1-250](file://src/screens/admin/AdminStories.tsx#L1-L250)
- [AdminStoryDetail.tsx:1-304](file://src/screens/admin/details/AdminStoryDetail.tsx#L1-L304)

**Section sources**
- [api.d.ts:33-62](file://convex/_generated/api.d.ts#L33-L62)
- [stories.ts:1-180](file://convex/stories.ts#L1-L180)
- [admin.ts:31-64](file://convex/admin.ts#L31-L64)
- [schema.ts:95-126](file://convex/schema.ts#L95-L126)
- [UploadFlow.tsx:1-511](file://src/screens/UploadFlow.tsx#L1-L511)
- [CreatorStoryEditor.tsx:1-635](file://src/screens/CreatorStoryEditor.tsx#L1-L635)
- [CreatorDashboard.tsx:1-322](file://src/screens/CreatorDashboard.tsx#L1-L322)
- [AdminStories.tsx:1-250](file://src/screens/admin/AdminStories.tsx#L1-L250)
- [AdminStoryDetail.tsx:1-304](file://src/screens/admin/details/AdminStoryDetail.tsx#L1-L304)

## Performance Considerations
- Use indexes for frequent queries (by status, creator, externalId).
- Batch asset uploads and avoid unnecessary re-uploads.
- Keep media sizes within limits to reduce storage and bandwidth costs.

## Troubleshooting Guide
- Story not found on publish: verify externalId and existence before invoking publish.
- Already published error: prevent duplicate publish attempts.
- Validation errors on publish: ensure title, images, and content are present.
- Update not applying: confirm selective fields are provided and story exists.

**Section sources**
- [stories.ts:163-179](file://convex/stories.ts#L163-L179)
- [UploadFlow.tsx:189-209](file://src/screens/UploadFlow.tsx#L189-L209)
- [CreatorStoryEditor.tsx:296-318](file://src/screens/CreatorStoryEditor.tsx#L296-L318)

## Conclusion
The Lemonade story editing and publishing system combines a robust schema, selective update mutations, and intuitive creator/admin frontends. It enforces validation, tracks revisions via timestamps, and supports flexible status management with moderation hooks. The dashboard and admin tools provide visibility and control over content health and performance.

## Appendices
- API reference generation: Convex auto-generates typed references for frontend consumption.
- Admin analytics: Overview and analytics queries provide insights into platform health and content performance.

**Section sources**
- [api.d.ts:33-62](file://convex/_generated/api.d.ts#L33-L62)
- [admin.ts:31-64](file://convex/admin.ts#L31-L64)