import { LessonTypes, MajorTypes } from "@/types/type";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataFetchContext";
import { useDev } from "@/contexts/DevContext";
import ErrorModal from "@/pages/ErrorModal";
import { FaAngleDown, FaAngleLeft, FaAngleUp, FaRegBookmark, FaBookmark } from "@/assets/icons";
import { useRouter } from 'next/router';

export default function ChosenMajor() {
    const { data, setData } = useData()
    const searchParams = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [devWidth, setDevWidth] = useState<number>(0);
    const [lessonsInCol, setLessonsInCol] = useState<number>(1);
    const [chosenScheduleData, setChosenScheduleData] = useState<MajorTypes | null>(null);
    const [searchedMajorName, setSearchedMajorName] = useState<string | null>(null)
    const [searchedMajorYear, setSearchedMajorYear] = useState<string | null>(null)
    const [searchedMajorType, setSearchedMajorType] = useState<string | null>(null)
    const [isSaved, setIsSaved] = useState<boolean>(false)

    const { isDev } = useDev();

    const router = useRouter()
    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', "Sobota", "Niedziela"];

    const [showDays, setShowDays] = useState<boolean[]>(() => {
        const initialShowDays = Array(daysOfWeek.length).fill(false);
        if (new Date().getDay() - 1 >= 0) {
            initialShowDays[new Date().getDay() - 1] = true;

        }
        return initialShowDays;
    });

    // getting isSaved
    useEffect(() => {
        if (localStorage.getItem("az-saved")) {
            setIsSaved(true)
        } else {
            setIsSaved(false)
        }
    }, [])

    // risizing
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            let columns;
            if (width < 640) {
                columns = 1;
            } else if (width < 768) {
                columns = 2;
            } else if (width < 1024) {
                columns = 3;
            } else if (width < 1280) {
                columns = 3;
            } else {
                columns = 5;
            }
            if (width > 768) {
                setShowDays(Array(daysOfWeek.length).fill(true));
            } else {
                const todayIndex = new Date().getDay() - 1;
                const initialShowDays = Array(daysOfWeek.length).fill(false);
                if (todayIndex >= 0) initialShowDays[todayIndex] = true;
                setShowDays(initialShowDays);
            }
            setLessonsInCol(columns);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // data fetching & setting dev width
    useEffect(() => {
        console.clear();
        setDevWidth(window.innerWidth)
        if (data) {
            if (isDev) console.log("Dane istnieją, nie trzeba ich pobierać:", data);
            setData(data);
        } else {
            const fetchData = async () => {

                try {
                    const response = await fetch('https://maramowicz.dev/azapi/database.json');
                    if (!response.ok) throw new Error("Failed to fetch data");
                    const jsonData: MajorTypes[] = await response.json();
                    const filteredData = jsonData.filter((major: MajorTypes) => {
                        return major.doc_type !== -1 && major.doc_type !== -2;
                    });
                    if (isDev) console.log("Przefiltrowane dane:", filteredData);
                    setData(filteredData);
                } catch (error) {
                    console.error(error);
                    setErrorMessage("Błąd przy pobieraniu danych.");
                    setTimeout(() => {
                        router.push("/k")
                    }, 1000);
                }
            };
            console.clear();
            fetchData();
        }
    }, []);

    // getting params
    useEffect(() => {
        const name = searchParams.get('k');
        const year = searchParams.get('r');
        const type = searchParams.get('t');

        setSearchedMajorName(name)
        setSearchedMajorYear(year)
        setSearchedMajorType(type)

        if (data && name && year) {
            const foundMajor = data.find(major => major.name == name && major.year == year && major.type == type);
            if (foundMajor) {
                setChosenScheduleData(foundMajor);
            }
        }
        const todayIndex = new Date().getDay() - 1;
        // Todo: Jeśli urządzenie jest małe to pokaż tylko jednen wybrany dzień
        const updatedShowDays = Array(daysOfWeek.length).fill(false);
        updatedShowDays[todayIndex] = true;
        setShowDays(updatedShowDays);
    }, [data, searchParams]);

    function renderChosenSchedule() {
        if (!chosenScheduleData) return null;
        const formatTime = (time: number) =>
            `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;

        const notEmptyDaysNum = chosenScheduleData.plan.filter(day => day.length > 0).length;

        if (isDev) console.log("Niepuste dni:", notEmptyDaysNum);
        if (notEmptyDaysNum < lessonsInCol) setLessonsInCol(notEmptyDaysNum);

        function renderDayName(dayIndex: number) {
            return <div className="flex px-2 py-1 text-black dark:text-white border dark:border-gray-950 rounded-lg shadow-[0px_1px_3px_1px_rgb(150,150,150)] dark:shadow-[0px_1px_3px_1px_rgb(0,0,0)]">
                <label htmlFor={String(dayIndex)} className="w-full text-xl py-1 cursor-pointer">
                    {daysOfWeek[dayIndex]}
                </label>
                <button
                    id={String(dayIndex)}
                    onClick={() => {
                        const newShowDays = [...showDays];
                        newShowDays[dayIndex] = !newShowDays[dayIndex];
                        setShowDays(newShowDays);
                    }}
                >
                    {showDays[dayIndex] ? <FaAngleUp className="text-4xl" /> : <FaAngleDown className="text-4xl" />}
                </button>
            </div>
        }

        function renderDay(day: LessonTypes[], dayIndex: number) {
            if (devWidth <= 639) {
                if (showDays.some((day) => day == true)) {
                    if (showDays[dayIndex]) {
                        return <li
                            key={dayIndex}
                            className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'h-full' : 'md:h-[22rem] lg:h-[30rem] xl:h-96'} flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto px-2 py-1`}
                        >
                            {renderDayName(dayIndex)}
                            {showDays[dayIndex] && (
                                <div
                                    className={`max-h-full grid ${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'grid-cols-2' : 'min-[471px]:grid-cols-2'
                                        } sm:grid-cols-1 gap-2 md:gap-3 custom-scrollbar overflow-x-hidden px-2 pb-1`}
                                >
                                    {day.map((lesson, index) => renderLesson(lesson, index))}
                                </div>
                            )}
                        </li>
                    }
                } else {
                    return <li
                        key={dayIndex}
                        className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'h-full' : 'md:h-80 lg:h-[28rem] xl:h-96'} flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto px-2 py-1`}
                    >
                        {renderDayName(dayIndex)}
                        {showDays[dayIndex] && (
                            <div
                                className={`max-h-full grid ${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'grid-cols-2' : 'min-[471px]:grid-cols-2'
                                    } sm:grid-cols-1 gap-2 md:gap-3 custom-scrollbar overflow-x-hidden px-2 pb-1`}
                            >
                                {day.map((lesson, index) => renderLesson(lesson, index))}
                            </div>
                        )}
                    </li>
                }
            } else {
                return <li
                    key={dayIndex}
                    className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'min-h-14 max-h-[90%]' : 'md:h-[21.5rem] md:min-h-[99%] lg:h-[26rem]'} flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto px-2 py-1`}
                >
                    {renderDayName(dayIndex)}
                    {showDays[dayIndex] && (
                        <div
                            className={`max-h-full grid ${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'grid-cols-2' : 'min-[471px]:grid-cols-2'
                                } sm:grid-cols-1 gap-2 md:gap-3 custom-scrollbar overflow-x-hidden px-2 pb-1`}
                        >
                            {day.map((lesson, index) => renderLesson(lesson, index))}
                        </div>
                    )}
                </li>
            }
        }

        function renderLesson(lesson: LessonTypes, index: number) {
            return <div
                key={index}
                className="relative min-h-40 flex items-center text-center justify-center flex-col shadow-[0px_2px_10px_1px_rgb(200,200,200)] dark:shadow-[0px_2px_10px_1px_rgb(10,10,10)] rounded-md text-black dark:text-white py-2 px-2 xl:my-0.5"
            >
                <p className="w-52 text-center">
                    {lesson.type}{" "}
                    {lesson.name.split(" ").map(word => (word.length > 7 ? word.slice(0, 5) + ". " : word + " "))}
                </p>
                <p>{lesson.subject}</p>
                <p className="w-48">{lesson.teacher}</p>
                <span>
                    {formatTime(lesson.start_minute)}-{formatTime(lesson.end_minute)}
                </span>
                <p>{lesson.place}</p>
            </div>
        }
        return (
            <ul
                style={{ gridTemplateColumns: `repeat(${lessonsInCol}, 1fr)` }}
                className={`w-full h-full grid content-start gap-1 md:pb-0 overflow-y-hidden px-2 py-1 ${isDev && "border border-black dark:border-white"
                    }`}
            >
                {chosenScheduleData.plan.map((day, index) => {
                    if (!Array.isArray(day) || day.length === 0) return null;
                    return renderDay(day, index);
                })}
            </ul>
        );
    }

    function toggleSave() {
        const saved = !isSaved
        setIsSaved(() => saved)
        if (saved) {
            localStorage.setItem("az-saved", `${searchedMajorName}&${searchedMajorYear}&${searchedMajorType}`)
            console.log("Zapisano", localStorage.getItem("az-saved"));
        } else {
            localStorage.removeItem("az-saved")
            console.log("Usunięto", localStorage.getItem("az-saved"));
        }
    }

    return (
        <div className={`h-[92vh] sm:h-[99vh] overflow-hidden ${isDev && "border border-black dark:border-white"}`}>
            <head>
                <title>{searchedMajorName} {searchedMajorYear} rok</title>
            </head>
            <div className="w-screen flex items-center md:py-1 px-2 shadow-[0px_1px_10px_1px_rgb(225,225,225)] dark:shadow-[0px_1px_10px_1px_rgb(10,10,10)]">
                <div className='w-full flex items-center justify-start py-3'>
                    <Link
                        href={'/k'}
                        className={`text-3xl md:text-3xl lg:text-4xl text-black dark:text-white  hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150`}>
                        <FaAngleLeft />
                    </Link>
                    <div className={`w-full flex items-center justify-center gap-3 text-xl text-center text-black dark:text-white`}>
                        {chosenScheduleData?.name ? (
                            devWidth < 444 ? (
                                chosenScheduleData.name.split(" ").length > 2
                                    ? chosenScheduleData.name.split(" ").map(word => word.length > 6 ? word.slice(0, 3) + ". " : word + " ").join("")
                                    : chosenScheduleData.name
                            ) : (
                                chosenScheduleData.name
                            )
                        ) : null} {" "}
                        {chosenScheduleData?.groups[0].slice(3, chosenScheduleData?.groups[0].length)}
                    </div>
                    {isSaved ?
                        <FaBookmark className="text-xl cursor-pointer" onClick={() => toggleSave()} />
                        :
                        <FaRegBookmark className="text-xl cursor-pointer" onClick={() => toggleSave()} />
                    }
                </div>
            </div>
            {chosenScheduleData && renderChosenSchedule()}
            {errorMessage && (
                <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
            )}
        </div>
    )
}