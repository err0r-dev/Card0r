import { HolidayTheme } from '@card0r/shared';
import { useVideoStore } from '../stores/videoStore';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

interface HolidayOption {
  id: HolidayTheme;
  name: string;
  emoji: string;
  category: string;
  gradient: string;
}

const HOLIDAYS: HolidayOption[] = [
  // Western
  { id: HolidayTheme.CHRISTMAS, name: 'Christmas', emoji: '🎄', category: 'Western', gradient: 'from-red-500 to-green-600' },
  { id: HolidayTheme.NEW_YEAR, name: 'New Year', emoji: '🎉', category: 'Western', gradient: 'from-yellow-400 to-pink-500' },
  { id: HolidayTheme.EASTER, name: 'Easter', emoji: '🐰', category: 'Western', gradient: 'from-pink-400 to-purple-400' },
  { id: HolidayTheme.VALENTINES_DAY, name: "Valentine's Day", emoji: '💖', category: 'Western', gradient: 'from-pink-500 to-red-500' },
  { id: HolidayTheme.HALLOWEEN, name: 'Halloween', emoji: '🎃', category: 'Western', gradient: 'from-orange-500 to-purple-600' },
  { id: HolidayTheme.THANKSGIVING, name: 'Thanksgiving', emoji: '🦃', category: 'Western', gradient: 'from-orange-600 to-amber-700' },

  // Jewish
  { id: HolidayTheme.ROSH_HASHANAH, name: 'Rosh Hashanah', emoji: '🍎', category: 'Jewish', gradient: 'from-amber-500 to-yellow-600' },
  { id: HolidayTheme.HANUKKAH, name: 'Hanukkah', emoji: '🕎', category: 'Jewish', gradient: 'from-blue-500 to-indigo-600' },
  { id: HolidayTheme.PASSOVER, name: 'Passover', emoji: '🍷', category: 'Jewish', gradient: 'from-amber-600 to-red-600' },

  // Islamic
  { id: HolidayTheme.EID_AL_FITR, name: 'Eid al-Fitr', emoji: '🌙', category: 'Islamic', gradient: 'from-green-500 to-teal-600' },
  { id: HolidayTheme.EID_AL_ADHA, name: 'Eid al-Adha', emoji: '🕌', category: 'Islamic', gradient: 'from-emerald-500 to-green-700' },
  { id: HolidayTheme.RAMADAN, name: 'Ramadan', emoji: '⭐', category: 'Islamic', gradient: 'from-indigo-600 to-purple-700' },

  // Asian
  { id: HolidayTheme.CHINESE_NEW_YEAR, name: 'Chinese New Year', emoji: '🐉', category: 'Asian', gradient: 'from-red-600 to-yellow-500' },
  { id: HolidayTheme.DIWALI, name: 'Diwali', emoji: '🪔', category: 'Asian', gradient: 'from-orange-500 to-yellow-500' },
  { id: HolidayTheme.LUNAR_NEW_YEAR, name: 'Lunar New Year', emoji: '🏮', category: 'Asian', gradient: 'from-red-500 to-orange-500' },

  // General
  { id: HolidayTheme.THANK_YOU, name: 'Thank You', emoji: '💝', category: 'General', gradient: 'from-pink-400 to-red-400' },
  { id: HolidayTheme.CONGRATULATIONS, name: 'Congratulations', emoji: '🎊', category: 'General', gradient: 'from-purple-500 to-yellow-500' },
];

const CATEGORIES = ['Western', 'Jewish', 'Islamic', 'Asian', 'General'];

export function HolidaySelector() {
  const { selectedTheme, setSelectedTheme } = useVideoStore();

  return (
    <div className="space-y-6">
      {CATEGORIES.map((category) => {
        const categoryHolidays = HOLIDAYS.filter((h) => h.category === category);

        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3">{category} Holidays</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryHolidays.map((holiday) => {
                const isSelected = selectedTheme === holiday.id;
                return (
                  <Card
                    key={holiday.id}
                    className={cn(
                      'cursor-pointer transition-all hover:scale-105 relative focus:outline-none focus:ring-4 focus:ring-amber-500',
                      isSelected
                        ? 'ring-4 ring-amber-500 dark:ring-amber-400 shadow-xl scale-105 bg-amber-50 dark:bg-amber-900/20'
                        : 'hover:shadow-md hover:ring-2 hover:ring-amber-300 dark:hover:ring-amber-500'
                    )}
                    onClick={() => setSelectedTheme(holiday.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTheme(holiday.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${holiday.name} theme${isSelected ? ' (currently selected)' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <CardContent className="p-0">
                      <div className={cn(
                        'h-24 bg-gradient-to-br rounded-t-xl flex items-center justify-center text-6xl relative',
                        holiday.gradient
                      )}>
                        {holiday.emoji}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-1">
                            <Check className="h-4 w-4 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        'p-4',
                        isSelected && 'bg-amber-50 dark:bg-amber-900/20'
                      )}>
                        <p className={cn(
                          'font-medium text-center',
                          isSelected && 'text-amber-900 dark:text-amber-100 font-bold'
                        )}>
                          {holiday.name}
                        </p>
                        {isSelected && (
                          <p className="text-xs text-center text-amber-700 dark:text-amber-300 mt-1">
                            ✓ Selected
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
