import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

type SignupMethod = {
  method: string;
  count: number;
  percentage: number;
};

type HeroStat = {
  hero: string;
  count: number;
};

type MapStat = {
  map: string;
  count: number;
};

type ActiveUser = {
  name: string;
  count: number;
};

type WeeklyReportEmailProps = {
  weekStart: string;
  weekEnd: string;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  matchesThisWeek: number;
  totalUsers: number;
  signupMethods: SignupMethod[];
  topHeroes: HeroStat[];
  topMaps: MapStat[];
  topUsers: ActiveUser[];
};

type DeltaSentiment = "positive" | "negative" | "neutral";

const deltaTextClass: Record<DeltaSentiment, string> = {
  positive: "text-green-600",
  negative: "text-red-600",
  neutral: "text-gray-500",
};

function getDeltaSentiment(current: number, previous: number): DeltaSentiment {
  if (current > previous) return "positive";
  if (current < previous) return "negative";
  return "neutral";
}

function formatDelta(current: number, previous: number): string {
  const delta = current - previous;
  if (delta > 0) return `+${delta} vs last week`;
  if (delta < 0) return `${delta} vs last week`;
  return "No change vs last week";
}

function StatCard({
  label,
  value,
  deltaLabel,
  sentiment,
}: {
  label: string;
  value: string;
  deltaLabel?: string;
  sentiment?: DeltaSentiment;
}) {
  return (
    <div className="rounded border border-solid border-gray-200 bg-gray-50 p-[16px]">
      <Text className="m-0 mb-[4px] text-[11px] leading-[16px] font-semibold tracking-wide text-gray-500 uppercase">
        {label}
      </Text>
      <Text className="m-0 mb-[4px] text-[24px] leading-[32px] font-bold text-gray-900">
        {value}
      </Text>
      {deltaLabel && sentiment && (
        <Text
          className={`m-0 text-[12px] leading-[18px] ${deltaTextClass[sentiment]}`}
        >
          {deltaLabel}
        </Text>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text className="m-0 mb-[12px] text-[13px] leading-[20px] font-semibold tracking-wide text-gray-700 uppercase">
      {children}
    </Text>
  );
}

export function WeeklyReportEmail({
  weekStart,
  weekEnd,
  newUsersThisWeek,
  newUsersLastWeek,
  matchesThisWeek,
  totalUsers,
  signupMethods,
  topHeroes,
  topMaps,
  topUsers,
}: WeeklyReportEmailProps) {
  const userDelta = newUsersThisWeek - newUsersLastWeek;
  const previewText = `${newUsersThisWeek} new user${newUsersThisWeek !== 1 ? "s" : ""} this week${userDelta !== 0 ? `, ${userDelta > 0 ? "+" : ""}${userDelta} vs last week` : ""}. ${matchesThisWeek} match${matchesThisWeek !== 1 ? "es" : ""} logged.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[500px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
                Weekly Usage Report
              </Heading>
              <Text className="m-0 mt-[-20px] mb-[24px] text-center text-[14px] leading-[22px] text-gray-500">
                {weekStart} &ndash; {weekEnd}
              </Text>
            </Section>

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />

            <SectionHeading>This week at a glance</SectionHeading>

            <Row className="mb-[10px]">
              <Column className="pr-[5px]">
                <StatCard
                  label="New Users"
                  value={newUsersThisWeek.toLocaleString()}
                  sentiment={getDeltaSentiment(
                    newUsersThisWeek,
                    newUsersLastWeek
                  )}
                  deltaLabel={formatDelta(newUsersThisWeek, newUsersLastWeek)}
                />
              </Column>
              <Column className="pl-[5px]">
                <StatCard
                  label="Matches Logged"
                  value={matchesThisWeek.toLocaleString()}
                  sentiment="neutral"
                />
              </Column>
            </Row>

            <Row className="mb-[20px]">
              <Column className="pr-[5px]">
                <StatCard
                  label="Total Users"
                  value={totalUsers.toLocaleString()}
                />
              </Column>
              <Column className="pl-[5px]" />
            </Row>

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />

            <SectionHeading>Signup methods</SectionHeading>

            {signupMethods.map((item) => (
              <Row key={item.method} className="mb-[8px]">
                <Column>
                  <Text className="m-0 text-[14px] leading-[22px] text-gray-700">
                    {item.method}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="m-0 text-[14px] leading-[22px] font-semibold text-gray-900">
                    {item.count.toLocaleString()}{" "}
                    <span className="font-normal text-gray-400">
                      ({item.percentage}%)
                    </span>
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />

            <SectionHeading>Most played heroes</SectionHeading>

            {topHeroes.map((item, index) => (
              <Row key={item.hero} className="mb-[8px]">
                <Column>
                  <Text className="m-0 text-[14px] leading-[22px] text-gray-700">
                    <span className="mr-[8px] text-gray-400">{index + 1}.</span>
                    {item.hero}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="m-0 text-[14px] leading-[22px] font-semibold text-gray-900">
                    {item.count.toLocaleString()}{" "}
                    <span className="font-normal text-gray-400">
                      {item.count === 1 ? "match" : "matches"}
                    </span>
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />

            <SectionHeading>Top maps this week</SectionHeading>

            {topMaps.map((item, index) => (
              <Row key={item.map} className="mb-[8px]">
                <Column>
                  <Text className="m-0 text-[14px] leading-[22px] text-gray-700">
                    <span className="mr-[8px] text-gray-400">{index + 1}.</span>
                    {item.map}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="m-0 text-[14px] leading-[22px] font-semibold text-gray-900">
                    {item.count.toLocaleString()}{" "}
                    <span className="font-normal text-gray-400">
                      {item.count === 1 ? "match" : "matches"}
                    </span>
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />

            <SectionHeading>Most active users</SectionHeading>

            {topUsers.map((item, index) => (
              <Row key={item.name} className="mb-[8px]">
                <Column>
                  <Text className="m-0 text-[14px] leading-[22px] text-gray-700">
                    <span className="mr-[8px] text-gray-400">{index + 1}.</span>
                    {item.name}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="m-0 text-[14px] leading-[22px] font-semibold text-gray-900">
                    {item.count.toLocaleString()}{" "}
                    <span className="font-normal text-gray-400">
                      {item.count === 1 ? "match" : "matches"}
                    </span>
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              This is an automated weekly report. If you have questions, reach
              out at <span className="text-blue-600">lucas@lux.dev</span>.
            </Text>

            {process.env.NODE_ENV !== "production" && (
              <Text className="text-[12px] leading-[24px] text-[#666666]">
                This email was sent from a development environment.
              </Text>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

WeeklyReportEmail.PreviewProps = {
  weekStart: "Feb 13, 2026",
  weekEnd: "Feb 20, 2026",
  newUsersThisWeek: 8,
  newUsersLastWeek: 5,
  matchesThisWeek: 142,
  totalUsers: 214,
  signupMethods: [
    { method: "Google", count: 98, percentage: 46 },
    { method: "Discord", count: 72, percentage: 34 },
    { method: "Email", count: 44, percentage: 20 },
  ],
  topHeroes: [
    { hero: "Ana", count: 312 },
    { hero: "Tracer", count: 278 },
    { hero: "Reinhardt", count: 241 },
    { hero: "Mercy", count: 198 },
    { hero: "Genji", count: 175 },
  ],
  topMaps: [
    { map: "King's Row", count: 34 },
    { map: "Lijiang Tower", count: 28 },
    { map: "Numbani", count: 19 },
  ],
  topUsers: [
    { name: "alice", count: 87 },
    { name: "bob", count: 64 },
    { name: "charlie", count: 51 },
  ],
} satisfies WeeklyReportEmailProps;

export default WeeklyReportEmail;
