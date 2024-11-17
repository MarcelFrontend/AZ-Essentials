import { LessonTypes } from "@/types/type";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useData } from '@/contexts/DataFetchContext';
import Link from "next/link";
import { FaAngleLeft } from "@/assets/icons";

export default function SearchResult() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<LessonTypes[]>([]);
    const [dayInput, setDayInput] = useState<string | null>("");
    const [searchInput, setSearchInput] = useState<string | null>("");
    const [searchType, setSearchType] = useState<string | null>("");
    const [timeInput, setTimeInput] = useState<string | null>("");
    const { data } = useData();
    const daysOfWeek: string[] = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', "Sobota", "Niedziela"];
    const colorsSmooth = "transition-colors duration-150"

    function performSearch() {
        const convertedTime = Number(timeInput?.split(":")[0]) * 60 + Number(timeInput?.split(":")[1]);
        const uniqueResults = new Set<LessonTypes>();

        if (searchInput && searchType && timeInput && dayInput) {
            data?.forEach(major => {
                const dayIndex = daysOfWeek.indexOf(dayInput);
                if (major.plan[dayIndex].length > 0)
                    major.plan[dayIndex].forEach(lesson => {
                        if (lesson.start_minute === convertedTime) {
                            if (searchType === "p") {
                                const isMatch = searchInput.split(" ").every(str => lesson.place.includes(str));
                                if (isMatch) {
                                    uniqueResults.add(lesson);
                                }
                            } else if (searchType === "t" && lesson.teacher === searchInput) {
                                uniqueResults.add(lesson);
                            }
                        }
                    });
            });
            setResults(Array.from(uniqueResults));
        } else {
            console.log("Brak wymaganych wartości.");
        }
    };

    useEffect(() => {
        setSearchType(searchParams.get('sT'));
        setSearchInput(searchParams.get('v'));
        setDayInput(searchParams.get('d'));
        setTimeInput(searchParams.get('h'));
    }, [searchParams]);

    useEffect(() => {
        if (data && searchInput && searchType && timeInput && dayInput) {
            performSearch();
        }
    }, [data, searchInput, searchType, timeInput, dayInput]);

    function formatTime(time: number) {
        return `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;
    }

    return (
        <div className="h-[91vh] md:h-[92vh] flex items-center justify-center">
            <Link className={`absolute -top-1 left-2 text-3xl lg:text-4xl mt-4 text-black dark:text-white dark:shadow-gray-600 p-1 hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`} href={`/d-w?sT=${searchType}`}>
                <FaAngleLeft />
            </Link>
            <ul className="relative -top-9 sm:top-0 h-[78%] flex items-center justify-center flex-col gap-2 md:gap-4 overflow-y-auto overflow-x-hidden px-2 pb-1.5 custom-scrollbar">
                {results.map((lesson, index) => (
                    <li key={index} className="w-80 sm:w-96 xl:w-[28rem] 2xl:w-[30rem] text-center text-black dark:text-white rounded-lg flex items-center flex-col md:gap-1 xl:gap-1.5 px-5 py-3 mr-1 text-2xl xl:text-3xl 2xl:text-4xl shadow-[0px_3px_8px_2px_rgb(100,100,100)] dark:shadow-[1px_2px_8px_1px_rgb(10,10,10)] transition-all hover:scale-[1.02] duration-100">
                        <div className="w-full flex justify-between">
                            <span>{dayInput}</span>
                            <span className="font-bold">{lesson.place}</span>
                        </div>
                        <p className="font-bold">{lesson.teacher} - {lesson.subject}</p>
                        <div className="w-full">
                            <p>{lesson.type} {lesson.name}</p>
                            <p>{formatTime(lesson.start_minute)} - {formatTime(lesson.end_minute)}</p>
                        </div>
                    </li>
                    // Todo: Dodaj przycisk to wyświetlenia wyświetlanej wartości dla każdego dnia
                ))}
            </ul>
        </div>
    );
};
