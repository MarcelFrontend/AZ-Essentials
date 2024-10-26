import { useTheme } from 'next-themes';
import { GoMoon, GoSun } from 'react-icons/go';
import { useDev } from '@/contexts/DevContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isDev, setIsDev } = useDev();
    const { systemTheme, theme, setTheme } = useTheme();
    const currentTheme = theme === 'system' ? systemTheme : theme;

    console.clear();

    return (
        <section>
            {children}
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="absolute bottom-2 right-3"
            >
                {currentTheme === 'dark' ? (
                    <GoSun className="h-12 md:h-14 lg:h-16 xl:h-20 w-auto px-1 py-1 hover:text-yellow-200 transition-colors duration-500" />
                ) : (
                    <GoMoon className="h-12 md:h-14 lg:h-16 xl:h-20 w-auto px-1 py-1 text-black hover:text-blue-800 transition-colors duration-500" />
                )}
            </button>
            <span
                onDoubleClick={() => setIsDev(true)}
                className="absolute bottom-4 md:bottom-1 left-2 text-gray-400 dark:text-gray-700 lg:text-xl leading-3"
            >
                Beta
            </span>
            {isDev && (
                <div className='absolute top-2 right-2 w-2 h-2 bg-red-500/25 rounded-full' />
            )}
        </section>
    );
}
