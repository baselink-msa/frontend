import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, Bot, CalendarDays, CupSoda, MapPin, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../api/gameApi';

const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1651179602825-a5cb093cd467?auto=format&fit=crop&q=80&w=2200',
    title: '오늘의 야구를 가장 편하게 즐기는 방법',
    description: '경기 예매부터 좌석 선택, 현장 주문, FAQ 안내까지 BaseLink에서 한 번에 확인하세요.',
  },
  {
    image:
      'https://images.unsplash.com/flagged/photo-1579277167836-cca446543e2d?auto=format&fit=crop&q=80&w=2200',
    title: '좋아하는 팀의 홈경기를 놓치지 마세요',
    description: '경기 일정과 예매 오픈 시간을 확인하고 원하는 좌석으로 빠르게 이동하세요.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1736132169144-d961f1cf03c1?auto=format&fit=crop&q=80&w=2200',
    title: '야구장 안에서도 더 여유롭게',
    description: '간단한 메뉴 주문과 야구 용어 FAQ로 관람 중 필요한 순간을 가볍게 해결합니다.',
  },
];

const quickLinks = [
  {
    to: '/games',
    icon: <CalendarDays size={22} />,
    title: '경기 예매',
    description: '다가오는 경기와 예매 가능 상태를 확인하세요.',
  },
  {
    to: '/my-tickets',
    icon: <Ticket size={22} />,
    title: '내 예매',
    description: '예매한 경기와 좌석 정보를 한눈에 봅니다.',
  },
  {
    to: '/orders',
    icon: <CupSoda size={22} />,
    title: '주류 주문',
    description: '관람 중 필요한 메뉴를 간단히 주문합니다.',
  },
  {
    to: '/chatbot',
    icon: <Bot size={22} />,
    title: 'FAQ 챗봇',
    description: '야구 용어와 이용 방법을 바로 물어보세요.',
  },
];

export function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="space-y-8">
      <div className="relative min-h-[520px] overflow-hidden rounded-lg bg-slate-950 shadow-soft">
        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/10" />
        <div className="relative flex min-h-[520px] max-w-3xl flex-col justify-end px-6 py-8 text-white sm:px-10 lg:px-12">
          <p className="text-sm font-bold text-blue-100">BaseLink</p>
          <h1 className="mt-3 max-w-2xl break-keep text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            {activeSlide.title}
          </h1>
          <p className="mt-5 max-w-2xl break-keep text-base leading-7 text-slate-100">
            {activeSlide.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/games"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
            >
              경기 보러가기
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/my-tickets"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-white/95 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-white"
            >
              내 예매 확인
            </Link>
          </div>
          <div className="mt-8 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`${index + 1}번째 이미지 보기`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-9 bg-white' : 'w-2.5 bg-white/45'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {quickLinks.map((item) => (
          <HomeLinkCard key={item.to} {...item} />
        ))}
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 md:grid-cols-[1fr_1fr] md:p-8">
        <RecommendedGame />
      </div>
    </section>
  );
}

function HomeLinkCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white">
        {icon}
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}

function RecommendedGame() {
  const { data } = useQuery({ queryKey: ['games'], queryFn: gameApi.getGames });
  const game = data?.data?.[0];

  if (!game) {
    return (
      <p className="col-span-2 text-sm text-slate-500">등록된 경기가 없습니다.</p>
    );
  }

  return (
    <>
      <div>
        <p className="text-sm font-bold text-blue-700">추천 경기</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          {game.homeTeamName} vs {game.awayTeamName}
        </h2>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <MapPin size={16} />
          {game.stadiumName}
        </p>
      </div>
      <div className="flex items-center justify-start md:justify-end">
        <Link
          to={`/games/${game.gameId}`}
          className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-800 hover:bg-blue-100"
        >
          경기 상세
          <ArrowRight size={17} />
        </Link>
      </div>
    </>
  );
}
