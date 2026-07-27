-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('FERPA_VIOLATION', 'CASE_CREATED', 'CASE_UPDATED', 'CASE_VIEWED', 'STUDENT_VIEWED', 'GUARDIANSHIP_CREATED');

-- CreateEnum
CREATE TYPE "ViolationReason" AS ENUM ('NO_GUARDIANSHIP', 'NO_FERPA_CONSENT', 'CONFIDENTIAL_CASE_RESTRICTED', 'ROLE_FORBIDDEN', 'STUDENT_INACTIVE', 'CASE_NOT_ASSIGNED', 'RESOURCE_NOT_FOUND');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorUserId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "reasonCode" "ViolationReason",
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
