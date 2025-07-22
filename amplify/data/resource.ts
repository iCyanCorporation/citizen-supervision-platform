import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { sendEmail } from "../functions/send-mail/resource.js";

/*== Data ===============================================================
The section below creates a database table with fields for citizen supervision platform.
=========================================================================*/
const schema = a
  .schema({
    // Civil Servant Management
    CivilServant: a
      .model({
        name: a.string().required(),
        position: a.string().required(),
        department: a.string().required(),
        location: a.string(),
        profileImage: a.string(),
        contactInfo: a.json(), // Store contact information as JSON
        obligations: a.hasMany("Obligation", "civilServantId"),
        kpis: a.hasMany("KPI", "civilServantId"),
        punchCardData: a.hasMany("PunchCard", "civilServantId"),
        supervisors: a.hasMany("Supervision", "civilServantId"),
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index("department"),
        index("position"),
        index("location"),
      ]),

    // Obligation Tracking
    Obligation: a
      .model({
        title: a.string().required(),
        description: a.string().required(),
        category: a.enum([
          "CAMPAIGN_PROMISE",
          "WORK_OBLIGATION",
          "PUBLIC_COMMITMENT",
        ]),
        status: a.enum([
          "PENDING",
          "IN_PROGRESS",
          "COMPLETED",
          "OVERDUE",
          "CANCELLED",
        ]),
        deadline: a.date(),
        evidence: a.string().array(), // Array of evidence URLs/references
        civilServantId: a.id().required(),
        civilServant: a.belongsTo("CivilServant", "civilServantId"),
        updates: a.hasMany("ObligationUpdate", "obligationId"),
        createdBy: a.id().required(), // User ID who created the obligation
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index("civilServantId"),
        index("createdBy"),
        index("status"),
        index("category"),
      ]),

    ObligationUpdate: a
      .model({
        obligationId: a.id().required(),
        obligation: a.belongsTo("Obligation", "obligationId"),
        status: a.enum([
          "PENDING",
          "IN_PROGRESS",
          "COMPLETED",
          "OVERDUE",
          "CANCELLED",
        ]),
        notes: a.string(),
        evidence: a.string().array(),
        updatedBy: a.id().required(), // User ID who made the update
        createdAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("obligationId"), index("updatedBy")]),

    // KPI Management
    KPI: a
      .model({
        title: a.string().required(),
        description: a.string(),
        target: a.float().required(),
        current: a.float().default(0),
        unit: a.string().required(),
        deadline: a.date().required(),
        civilServantId: a.id().required(),
        civilServant: a.belongsTo("CivilServant", "civilServantId"),
        updates: a.hasMany("KPIUpdate", "kpiId"),
        createdBy: a.id().required(), // User ID who created the KPI
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index("civilServantId"),
        index("createdBy"),
        index("deadline"),
      ]),

    KPIUpdate: a
      .model({
        kpiId: a.id().required(),
        kpi: a.belongsTo("KPI", "kpiId"),
        previousValue: a.float().required(),
        newValue: a.float().required(),
        notes: a.string(),
        evidence: a.string().array(),
        updatedBy: a.id().required(), // User ID who made the update
        createdAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("kpiId"), index("updatedBy")]),

    // Punch Card System
    PunchCard: a
      .model({
        date: a.date().required(),
        checkIn: a.time(),
        checkOut: a.time(),
        status: a.enum(["PRESENT", "ABSENT", "LATE", "EARLY_LEAVE", "HOLIDAY"]),
        notes: a.string(),
        civilServantId: a.id().required(),
        civilServant: a.belongsTo("CivilServant", "civilServantId"),
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index("civilServantId"),
        index("date"),
        index("status"),
      ]),

    // Citizen Points System
    CitizenPoints: a
      .model({
        userId: a.id().required(), // Cognito User ID
        balance: a.integer().default(0),
        totalEarned: a.integer().default(0),
        totalSpent: a.integer().default(0),
        transactions: a.hasMany("PointTransaction", "citizenPointsId"),
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("userId")]),

    PointTransaction: a
      .model({
        citizenPointsId: a.id().required(),
        citizenPoints: a.belongsTo("CitizenPoints", "citizenPointsId"),
        type: a.enum(["EARNED", "SPENT", "REFUNDED"]),
        amount: a.integer().required(),
        reason: a.string().required(),
        referenceId: a.string(), // Reference to related entity (obligation, KPI, etc.)
        referenceType: a.string(), // Type of reference (obligation, kpi, reward, etc.)
        createdAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("citizenPointsId"), index("type")]),

    // Rewards System
    Reward: a
      .model({
        title: a.string().required(),
        description: a.string().required(),
        pointCost: a.integer().required(),
        category: a.enum([
          "DIGITAL_BADGE",
          "NFT_MEDAL",
          "PHYSICAL_ITEM",
          "EXPERIENCE",
        ]),
        isActive: a.boolean().default(true),
        stock: a.integer(),
        image: a.string(),
        redemptions: a.hasMany("RewardRedemption", "rewardId"),
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("category"), index("pointCost")]),

    RewardRedemption: a
      .model({
        rewardId: a.id().required(),
        reward: a.belongsTo("Reward", "rewardId"),
        userId: a.id().required(), // Cognito User ID
        pointsSpent: a.integer().required(),
        status: a.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]),
        deliveryInfo: a.json(), // Delivery information for physical items
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index("rewardId"),
        index("userId"),
        index("status"),
      ]),

    // Supervision Relationships
    Supervision: a
      .model({
        userId: a.id().required(), // Cognito User ID of the citizen
        civilServantId: a.id().required(),
        civilServant: a.belongsTo("CivilServant", "civilServantId"),
        isActive: a.boolean().default(true),
        preferences: a.json(), // User preferences for this supervision
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("userId"), index("civilServantId")]),

    // Notifications
    Notification: a
      .model({
        userId: a.id().required(), // Cognito User ID
        title: a.string().required(),
        message: a.string().required(),
        type: a.enum(["DEADLINE", "UPDATE", "ACHIEVEMENT", "SYSTEM"]),
        isRead: a.boolean().default(false),
        referenceId: a.string(), // Reference to related entity
        referenceType: a.string(), // Type of reference
        createdAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("userId"), index("type")]),

    // User Preferences
    UserPreferences: a
      .model({
        userId: a.id().required(), // Cognito User ID
        language: a.string().default("en"),
        theme: a.enum(["light", "dark", "system"]),
        notifications: a.json(), // Notification preferences
        dashboardLayout: a.json(), // Dashboard customization
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [index("userId")]),

    // System Settings
    Settings: a.model({
      key: a.string().required(),
      value: a.string().required(),
      description: a.string(),
      group: a.string(),
      isPublic: a.boolean().default(false), // Whether setting is publicly readable
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    }),

    // functions
    sendEmail: a
      .query()
      .arguments({
        name: a.string(),
        myEmail: a.string(), // sender email address
        emailAddresses: a.string().array(), // recipient email addresses
        subject: a.string(), // email subject
        bodyText: a.string(), // email body
      })
      .returns(a.string())
      .authorization((allow) => [allow.guest()]) // independent authorization
      .handler(a.handler.function(sendEmail)),
  })
  .authorization((allow) => [
    // Public read access for civil servant profiles
    allow.guest().to(["read"]),
    // Authenticated users can read and create/update most data
    allow.authenticated().to(["read", "create", "update"]),
    // Owner access for user-specific data
    allow.owner(),
  ]);

export type Schema = ClientSchema<typeof schema>;

/*== Auth ===============================================================
The section below creates an auth for the database table.
=========================================================================*/
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // apiKey iam userPool
    // apiKeyAuthorizationMode: {
    //   expiresInDays: 365,
    // },
  },
});
