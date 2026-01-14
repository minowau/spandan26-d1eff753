import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Trophy, Users, Zap } from 'lucide-react';
import { useSportsByCategory, useSettings } from '@/hooks/useSportsData';
import { CountdownTimer } from '@/components/CountdownTimer';
import { RunningMatchesBanner } from '@/components/RunningMatchesBanner';

const Index = () => {
  const { data: teamSports } = useSportsByCategory('team');
  const { data: individualSports } = useSportsByCategory('individual');
  const { data: minorSports } = useSportsByCategory('minor');
  const { data: settings } = useSettings();

  const festStartDate = settings?.fest_start_date 
    ? new Date(settings.fest_start_date) 
    : new Date('2026-01-22T09:00:00');

  return (
    <div className="min-h-screen">
      {/* Running Matches Banner */}
      <RunningMatchesBanner />

      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                January 22-25, 2026
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground leading-none mb-6">
                SPANDAN<br />
                <span className="text-accent">'26</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mb-8">
                Four days of intense competition, team spirit, and unforgettable moments. 
                Watch live streams, track schedules, and follow your favorite teams.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/schedule"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  View Schedule
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/team-sports"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-foreground/10 text-primary-foreground font-semibold hover:bg-primary-foreground/20 transition-colors border border-primary-foreground/20"
                >
                  Explore Sports
                </Link>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex justify-center lg:justify-end">
              <CountdownTimer targetDate={festStartDate} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{teamSports?.length || 5}</div>
              <div className="text-sm text-muted-foreground mt-1">Team Sports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-sport-green">{individualSports?.length || 3}</div>
              <div className="text-sm text-muted-foreground mt-1">Individual Sports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">{minorSports?.length || 4}</div>
              <div className="text-sm text-muted-foreground mt-1">Minor Sports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">4</div>
              <div className="text-sm text-muted-foreground mt-1">Days of Action</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">EXPLORE SPORTS</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From team battles to individual showdowns, find your favorite sports and never miss a match.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link to="/team-sports" className="group">
              <div className="sport-card sport-card-team h-full">
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Team Sports</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cricket, Football, Volleyball & more with live points tables
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {teamSports?.slice(0, 3).map((sport) => (
                      <span key={sport.id} className="text-2xl">{sport.icon}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/individual-sports" className="group">
              <div className="sport-card sport-card-individual h-full">
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-sport-green/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="w-8 h-8 text-sport-green" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Individual Sports</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Badminton, Chess & Table Tennis with live streaming
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {individualSports?.map((sport) => (
                      <span key={sport.id} className="text-2xl">{sport.icon}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/minor-sports" className="group">
              <div className="sport-card sport-card-minor h-full">
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Minor Sports</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gully Cricket, Tug of War, Pentathlon & Carrom
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {minorSports?.map((sport) => (
                      <span key={sport.id} className="text-2xl">{sport.icon}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-4">DON'T MISS A MOMENT</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Check the complete schedule filtered by date and never miss your favorite matches.
          </p>
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <Calendar className="w-5 h-5" />
            View Full Schedule
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;