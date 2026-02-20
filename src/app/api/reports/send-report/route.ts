import { WeeklyReportEmail } from "@/components/email/weekly-report";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { render } from "@react-email/render";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalizeProvider(providerId: string): string {
  if (providerId === "credential") return "Email";
  return providerId.charAt(0).toUpperCase() + providerId.slice(1);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisWeek,
    newUsersLastWeek,
    matchesThisWeek,
    providerGroups,
    heroGroups,
    mapGroups,
    topUserGroups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({
      where: { createdAt: { gte: prevWeekStart, lt: weekStart } },
    }),
    prisma.match.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.account.groupBy({
      by: ["providerId"],
      _count: { userId: true },
    }),
    prisma.matchHero.groupBy({
      by: ["hero"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.match.groupBy({
      by: ["map"],
      _count: { id: true },
      where: { createdAt: { gte: weekStart } },
      orderBy: { _count: { id: "desc" } },
      take: 3,
    }),
    prisma.match.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 3,
    }),
  ]);

  const signupMethodsTotal = providerGroups.reduce(
    (sum, p) => sum + p._count.userId,
    0
  );
  const signupMethods = providerGroups
    .sort((a, b) => b._count.userId - a._count.userId)
    .map((p) => ({
      method: capitalizeProvider(p.providerId),
      count: p._count.userId,
      percentage:
        signupMethodsTotal > 0
          ? Math.round((p._count.userId / signupMethodsTotal) * 100)
          : 0,
    }));

  const topHeroes = heroGroups.map((h) => ({
    hero: h.hero,
    count: h._count.id,
  }));

  const topMaps = mapGroups.map((m) => ({
    map: m.map,
    count: m._count.id,
  }));

  const topUserIds = topUserGroups.map((u) => u.userId);
  const topUserRecords = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true },
  });
  const userNameById = new Map(topUserRecords.map((u) => [u.id, u.name]));
  const topUsers = topUserGroups.map((u) => ({
    name: userNameById.get(u.userId) ?? "Unknown",
    count: u._count.id,
  }));

  const emailHtml = await render(
    WeeklyReportEmail({
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(now),
      newUsersThisWeek,
      newUsersLastWeek,
      matchesThisWeek,
      totalUsers,
      signupMethods,
      topHeroes,
      topMaps,
      topUsers,
    })
  );

  try {
    await sendEmail({
      to: "lucas@lux.dev",
      from: "noreply@lux.dev",
      subject: `Winrate Tracker Weekly Report — ${formatDate(weekStart)} to ${formatDate(now)}`,
      html: emailHtml,
    });
  } catch {
    return new Response("Failed to send weekly report", { status: 500 });
  }

  return Response.json({
    success: true,
    stats: {
      newUsersThisWeek,
      newUsersLastWeek,
      matchesThisWeek,
      totalUsers,
    },
  });
}
