import { LessonTypes, MajorTypes } from "@/types/type";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useData } from '@/contexts/DataFetchContext';
import Link from "next/link";
import { FaAngleLeft } from "@/assets/icons";
import { useRouter } from "next/router";
import ErrorModal from "@/pages/ErrorModal";

export default function SearchResult() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<LessonTypes[]>([]);
    const [dayInput, setDayInput] = useState<string | null>("");
    const [searchInput, setSearchInput] = useState<string | null>("");
    const [searchType, setSearchType] = useState<string | null>("");
    const [timeInput, setTimeInput] = useState<string | null>("");
    const { data, setData } = useData();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter()
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

    // Pobieranie parametrów
    useEffect(() => {
        setSearchType(searchParams.get('t'));
        setSearchInput(searchParams.get('v'));
        setDayInput(searchParams.get('d'));
        setTimeInput(searchParams.get('h'));
    }, [searchParams]);

    useEffect(() => {
        if (!data) {
            const fetchData = async () => {
                try {
                    const response = await fetch('https://maramowicz.dev/azapi/database.json');
                    if (!response.ok) throw new Error("Failed to fetch data");
                    const jsonData: MajorTypes[] = await response.json();
                    const filteredData = jsonData.filter((major: MajorTypes) => {
                        return major.doc_type !== -1 && major.doc_type !== -2;
                    });

                    setData(filteredData);
                } catch (error) {
                    console.error(error);
                    setErrorMessage("Błąd przy pobieraniu danych.");
                    setTimeout(() => {
                        router.push("/")
                    }, 2000)
                }
            };
            fetchData();
            console.log("Po pobraniu danych:", data);
        } else {
            console.log("Dane istniały");
        }
        console.clear();
    }, []);

    // Szukanie wyszukanego obiektu
    useEffect(() => {
        if (data && searchInput && searchType && timeInput && dayInput) {
            performSearch();
        }

    }, [data, searchInput, searchType, timeInput, dayInput]);

    function formatTime(time: number) {
        return `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <head>
                <title>Wynik wyszukiwania</title>
            </head>
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
            {errorMessage && (
                <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
            )}
        </div>
    );
};
