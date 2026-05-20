-- CreateTable
CREATE TABLE "CalendarInvitation" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarInvitation_token_key" ON "CalendarInvitation"("token");

-- CreateIndex
CREATE INDEX "CalendarInvitation_token_idx" ON "CalendarInvitation"("token");

-- CreateIndex
CREATE INDEX "CalendarInvitation_calendarId_idx" ON "CalendarInvitation"("calendarId");

-- AddForeignKey
ALTER TABLE "CalendarInvitation" ADD CONSTRAINT "CalendarInvitation_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarInvitation" ADD CONSTRAINT "CalendarInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
