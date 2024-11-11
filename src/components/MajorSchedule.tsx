// Todo: co: daj możliwość wpisania albo w innej formie pokazania najbliższych lekcji
// Todo: Pielęgniatstwo rok 2 niestacjonarne problem z sobotą
import { useDev } from '@/contexts/DevContext';
import ErrorModal from '@/pages/ErrorModal';
import React, { useCallback, useEffect, useState } from 'react';
import { MajorTypes } from '@/types/type';

import {
    FaAngleDown,
    FaAngleUp,
    FaAngleLeft,
    HiCommandLine,
    FaDumbbell,
    GiAngelOutfit,
    FaUserNurse,
    FaCoins,
    FaChalkboardTeacher,
    GoLaw,
    FaShieldAlt,
    FaImages,
    FaAmbulance,
    MdEngineering,
    FaMapMarkedAlt,
    FaToilet,
    FaBookOpen,
    IoFilter
} from '@/assets/icons';
import { IoIosInformationCircleOutline } from "react-icons/io";

interface MajorScheduleProps {
    firstTryFetchingData: MajorTypes[] | null | undefined;
    returnToMenu: () => void
}

const MajorSchedule: React.FC<MajorScheduleProps> = ({ firstTryFetchingData, returnToMenu }) => {
    const [data, setData] = useState<MajorTypes[]>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [searchedMajor, setSearchedMajor] = useState<string>("");
    const [chosenScheduleData, setChosenScheduleData] = useState<MajorTypes | null>(null);
    const [filteredMajors, setFilteredMajors] = useState<MajorTypes[] | undefined>(data);
    const [devWidth, setDevWidth] = useState<number>(0);
    const [showYearSelection, setShowYearSelection] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<string[]>()
    const { isDev } = useDev();
    const [lessonsInCol, setLessonsInCol] = useState<number>(1);

    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', "Sobota", "Niedziela"];
    const [showDays, setShowDays] = useState<boolean[]>(() => {
        const initialShowDays = Array(daysOfWeek.length).fill(false);
        if (new Date().getDay() - 1 >= 0) {
            initialShowDays[new Date().getDay() - 1] = true;
        }
        return initialShowDays;
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setDevWidth(width);

            if (width > 768) {
                setShowDays(Array(daysOfWeek.length).fill(true));
            } else {
                const todayIndex = new Date().getDay() - 1;
                const initialShowDays = Array(daysOfWeek.length).fill(false);
                if (todayIndex >= 0) initialShowDays[todayIndex] = true;
                setShowDays(initialShowDays);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const colorsSmooth = "transition-colors duration-75";
    const shadowSmooth = "transition-shadow duration-[1.25s] delay-300 dark:duration-1000 dark:delay-100"
    const devBorder = "border border-black dark:border-white";
    const yearSelectionEl = "px-3 py-0.5 min-[480px]:px-3 min-[480px]:py-0.5  text-lg min-[480px]:text-base rounded-md cursor-pointer bg-gray-300 dark:bg-gray-700 transition-colors duration-100";
    const interStyles = "md:hover:scale-105 md:active:scale-95 transition-all duration-75"
    const majorYears = ["1", "2", "3"];

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
                columns = 4;
            } else {
                columns = 5;
            }
            setLessonsInCol(columns);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        console.clear();
        setDevWidth(window.innerWidth)
        // if(window.innerWidth > )
        if (firstTryFetchingData) {
            if (isDev) console.log("Dane istnieją, nie trzeba ich pobierać");
            if (isDev) console.log(firstTryFetchingData);
            setData(firstTryFetchingData);
            const majorNameSuggestions = new Set<string>()
            firstTryFetchingData.map(major => {
                if (major.name) majorNameSuggestions.add(major.name)
            })
            setSuggestions(Array.from(majorNameSuggestions))

        } else {
            const fetchData = async () => {
                try {
                    const response = await fetch('https://maramowicz.dev/azapi/database.json');
                    if (!response.ok) throw new Error("Failed to fetch data");
                    const jsonData: MajorTypes[] = await response.json();
                    const filteredData = jsonData.filter((major: MajorTypes) => {
                        return major.doc_type !== -1 && major.doc_type !== -2;
                    });
                    if (isDev) console.log(filteredData);
                    const majorNameSuggestions = new Set<string>()
                    filteredData.map(major => {
                        if (major.name) majorNameSuggestions.add(major.name)
                    })
                    setSuggestions(Array.from(majorNameSuggestions))

                    setData(filteredData);
                } catch (error) {
                    console.error(error);
                    setErrorMessage("Błąd przy pobieraniu danych.");
                    setTimeout(() => {
                        returnToMenu();
                    }, 1000);
                }
            };
            console.clear();
            fetchData();
        }
    }, []);

    function renderChosenSchedule() {
        function formatTime(time: number) {
            return `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;
        }
        if (!chosenScheduleData) return null;

        const notEmptyDaysNum = chosenScheduleData.plan.filter(day => day.length > 0).length

        if (isDev) console.log("Nie puste dni", notEmptyDaysNum);
        if (notEmptyDaysNum < lessonsInCol) setLessonsInCol(notEmptyDaysNum)
        return (
            <ul style={{ gridTemplateColumns: `repeat(${lessonsInCol}, 1fr)` }} className={`w-full h-full grid content-start gap-1 md:pb-0 overflow-y-hidden px-2 pt-1`}>
                {
                    // Todo: zło konieczne: Opracować algorytm, który będzie dobierać ilość kolumn w zależności od tego jaka jest szerokość urządzenia oraz ile jest dni w których są lekcje
                    chosenScheduleData?.plan.map((day, index) => {
                        if (typeof day == "string" || day.length == 0) return
                        if (isDev) console.log(daysOfWeek[index], day)
                        return (
                            <li key={index} className={`${(notEmptyDaysNum === lessonsInCol) && devWidth > 768 ? 'h-full' : 'md:h-72 lg:h-[28rem] xl:h-96'} flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto px-2 pt-1`}>
                                <div className={`flex px-2 text-black dark:text-white border dark:border-gray-950 rounded-lg py-1 shadow-[0px_1px_3px_1px_rgb(150,150,150)] dark:shadow-[0px_1px_3px_1px_rgb(0,0,0)]`}>
                                    <label htmlFor={String(index)} className='w-full text-xl py-1 cursor-pointer '>
                                        {daysOfWeek[index]}
                                    </label>
                                    <button id={String(index)} onClick={() => {
                                        const newShowDays = [...showDays];
                                        newShowDays[index] = !newShowDays[index];
                                        setShowDays(newShowDays);
                                    }}>
                                        {showDays[index] ? <FaAngleUp className='text-4xl' /> : <FaAngleDown className='text-4xl' />}
                                    </button>
                                </div>
                                <div className={`max-h-full ${(notEmptyDaysNum === lessonsInCol) && devWidth > 768 ? 'grid-cols-2 min-[1441px]:grid-cols-2' : 'min-[471px]:grid-cols-2'} grid sm:grid-cols-1 gap-2 md:gap-3 md:overflow-y-auto custom-scrollbar overflow-x-hidden px-2 pb-1`}>
                                    {showDays[index] && (
                                        day.map((lesson, lessonIndex) => {
                                            if (isDev) console.log(lesson);
                                            return (
                                                // <div key={lessonIndex} className='relative max-h-fit flex items-center justify-between px-2 border'>
                                                //     <div className='h-full flex flex-col items-center justify-between border-r pr-1'>
                                                //         <span>{formatTime(lesson.start_minute)}</span>
                                                //         <span>{formatTime(lesson.end_minute)}</span>

                                                //     </div>
                                                //     <div className='w-full h-full flex items-start justify-start flex-col pl-1'>
                                                //         <span>{lesson.type} {lesson.name.split(" ").map(word => {
                                                //             if (word.length > 3) {
                                                //                 return word.slice(0, 3) + ". "
                                                //             } else {
                                                //                 return word + " "
                                                //             }
                                                //         })}</span>
                                                //         <span>{lesson.teacher}</span>
                                                //         <p>{lesson.place}</p>
                                                //     </div>
                                                //     <IoIosInformationCircleOutline className='absolute bottom-3 right-3 text-3xl' />
                                                // </div>
                                                <div key={lessonIndex} className={`relative min-h-40 flex items-center text-center justify-center flex-col shadow-[0px_2px_10px_1px_rgb(200,200,200)] dark:shadow-[0px_2px_10px_1px_rgb(10,10,10)] rounded-md text-black dark:text-white py-2 px-2 xl:my-0.5`}>
                                                    <p className='w-52 text-center'>
                                                        {lesson.type} {" "}
                                                        {/* {lesson.name.length > 45 ? lesson.name.slice(0, 40) + "..." : lesson.name} */}
                                                        {lesson.name.split(" ").map(word => {
                                                            if (word.length > 7) {
                                                                return word.slice(0, 5) + ". "
                                                            } else {
                                                                return word + " "
                                                            }
                                                        })}
                                                    </p>
                                                    <p>{lesson.subject}</p>
                                                    <p className='w-48'>{lesson.teacher}</p>
                                                    <span>{formatTime(lesson.start_minute)}-{formatTime(lesson.end_minute)}</span>
                                                    <p>{lesson.place}</p>
                                                    <IoIosInformationCircleOutline className='absolute bottom-3 right-3 text-3xl' />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </li >
                        );
                    })}
            </ul>
        )
    }

    function fetchSearchedMajor(searchedMajor: string) {
        setSearchedMajor(searchedMajor);
        if (searchedMajor.length >= 2) {
            const resultMajors = new Set<MajorTypes>();

            data?.forEach(major => {
                if (major.name && major.name.toLowerCase().includes(searchedMajor.toLowerCase())) {
                    resultMajors.add(major);
                }
            });
            setFilteredMajors(Array.from(resultMajors));
        } else {
            setFilteredMajors([]);
        }
    }

    function getMajorIcon(majorName: string) {
        switch (majorName.trim()) {
            case "Pielęgniarstwo":
                return <GiAngelOutfit />
            case "Rynek sztuki i zarządzanie w kulturze":
                return <FaImages />
            case "Fizjoterapia":
                return <FaDumbbell />
            case "Ratownictwo medyczne":
                return <FaAmbulance />
            case "Turystyka i rekreacja":
                return <FaMapMarkedAlt />
            case "Informatyka":
                return <HiCommandLine />
            case "Mechanika i budowa maszyn":
                return <MdEngineering />
            case "Położnictwo":
                return <FaUserNurse />
            case "Pedagogika":
                return <FaChalkboardTeacher />
            case "Finanse i rachunkowość":
                return <FaCoins />
            case "Prawo":
                return <GoLaw />
            case "Bezpieczeństwo narodowe":
                return <FaShieldAlt />
            case "Logistyka":
                return <FaToilet />
            case "Filologia angielska":
                return <FaBookOpen />
            default:
                break;
        }
    }

    function getMajors(majors: MajorTypes[]) {
        // Todo: opcjonalne: Sortowanie, czyli na początku wyświetlą się 1 roki
        return majors.map((major, index) => {
            if (major.name && major.year && major.type && (selectedYear === null || major.year == selectedYear)) {
                return (
                    <button onClick={() => setChosenScheduleData(major)} className={`relative h-36 w-full min-[1300px]:h-44 flex items-center justify-center flex-col gap-0.5 text-center px-2 py-1 text-black dark:text-white rounded-md shadow-[0px_2px_5px_2px_rgb(200,200,200)] dark:shadow-[0px_2px_10px_2px_rgb(5,5,5)] ${shadowSmooth} ${isDev && devBorder} transition-colors duration-500 ${interStyles}`}
                        key={index}>
                        <div className='absolute top-1 right-1 text-3xl md:text-4xl'>
                            {getMajorIcon(major.name)}
                        </div>
                        <span className='absolute top-1 left-1'>
                            {major.groups[0]}
                        </span>
                        <span className='w-[90%] min-[1300px]:w-full'>
                            {major.name}
                        </span>
                        <span>
                            {major.type}
                        </span>
                    </button>
                );
            }
            return null;
        });
    }

    const showMajors = useCallback(() => {
        if (filteredMajors && searchedMajor.length >= 2) {
            if (isDev) console.log("To się wywoła potem");
            return getMajors(filteredMajors);
        } else {
            if (isDev) console.log("To się wywoła kiedy zmienimy selectedYear:", selectedYear);
            if (data) return getMajors(data);
        }
    }, [filteredMajors, selectedYear, data]);

    return (
        <div className={`relative h-[86.7vh] md:h-[93vh] flex items-center flex-col overflow-hidden ${isDev && devBorder}`}>
            <div className={`relative w-screen h-fit flex items-center md:py-1 px-2 shadow-[0px_1px_10px_1px_rgb(225,225,225)] dark:shadow-[0px_1px_10px_1px_rgb(10,10,10)] ${shadowSmooth}`}>
                {!chosenScheduleData ? (
                    <div className='relative w-full flex items-center gap-5 pr-5 md:pr-2'>
                        {/* Wszysktie kierunki */}
                        <button
                            onClick={() => returnToMenu()}
                            className={`text-3xl md:text-4xl lg:text-4xl text-black dark:text-white dark:shadow-gray-600 hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`}>
                            <FaAngleLeft />
                        </button>
                        <div className='w-full flex justify-center'>
                            <input value={searchedMajor} onChange={(e) => fetchSearchedMajor(e.target.value)} className={`w-3/4 pl-2 py-1 md:py1.5 mt-2 mb-1.5 text-xl md:text-lg 2xl:text-2xl bg-transparent border-2 border-gray-700 rounded-lg outline-none focus:border-gray-200 dark:focus:border-gray-400 shadow-[inset_1px_1px_6px_1px_rgb(225,225,225)] dark:shadow-[inset_1px_1px_6px_1px_rgb(10,10,10)] text-black dark:text-white ${shadowSmooth}`} type="text" placeholder='Wpisz kierunek' list='suggestions' />
                            {searchedMajor.length > 1 && (
                                <datalist id="suggestions">
                                    {suggestions?.map((item, i) => (
                                        <option key={i} value={item} />
                                    ))}
                                </datalist>
                            )}
                        </div>
                        <IoFilter title='Wybierz rok do wyświetlenia' onClick={() => setShowYearSelection(!showYearSelection)} className={`text-3xl xl:text-4xl text-black dark:text-white transition-colors duration-100 cursor-pointer ${interStyles}`} />
                        {showYearSelection && (
                            <div className={`absolute right-4 top-14 flex flex-col items-center bg-white dark:bg-gray-900 z-10 p-2 rounded-xl transition-colors duration-[2s]`}>
                                <span className={`text-2xl sm:text-3xl mb-1 text-black dark:text-white ${colorsSmooth}`}>Wybierz rok</span>
                                <ul className='flex flex-col gap-2'>
                                    <li
                                        onClick={() => { setSelectedYear(null); setTimeout(() => { setShowYearSelection(false) }, 100) }}
                                        className={`${yearSelectionEl} ${interStyles} 
                                            ${selectedYear == null ? "bg-gray-600 dark:bg-white text-white dark:text-black" : "text-black dark:text-white "}`}>
                                        <span className={`${selectedYear == null ? "text-white dark:text-black" : "text-black dark:text-white "} text-lg sm:text-2xl`}>
                                            Wszystkie
                                        </span>
                                    </li>
                                    {majorYears.map((year, index) => (
                                        <li
                                            onClick={() => { setSelectedYear(year); setTimeout(() => { setShowYearSelection(false) }, 100) }}
                                            key={index}
                                            className={`${yearSelectionEl} ${interStyles} text-center 
                                            ${selectedYear == year && "bg-gray-600 dark:bg-white"} ${colorsSmooth}`}>
                                            <span className={`${selectedYear == year ? "text-white dark:text-black " : "text-black dark:text-white"} ${colorsSmooth}`}>
                                                Rok {year}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='w-full flex items-center justify-center py-3 '>
                        {/* ; setShowDays(Array(daysOfWeek.length).fill(false))  */}
                        <button
                            onClick={() => setChosenScheduleData(null)}
                            className={`text-3xl md:text-3xl lg:text-4xl text-black dark:text-white  hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`}>
                            <FaAngleLeft />
                        </button>
                        <div className={`w-full flex items-center justify-center gap-3 text-xl text-center text-black dark:text-white ${colorsSmooth}`}>
                            {devWidth < 444 ? chosenScheduleData.name?.split(" ").map(word => word.length > 6 ? word.slice(0, 3) + ". " : word + " ") : chosenScheduleData.name} {" "}
                            {chosenScheduleData.groups[0]}
                        </div>
                    </div>
                )}
            </div>
            {!chosenScheduleData &&
                <div className='w-full flex items-center justify-center flex-col overflow-y-hidden sm:px-3'>
                    <div className={`w-full min-[1300px]:w-[90vw] h-full flex items-center justify-center flex-col sm:rounded-lg overflow-hidden sm:mb-1 px-2 ${isDev && devBorder}`}>
                        {/* min-[1893px]:w-fit */}
                        <ul className={`w-full grid grid-cols-2 min-[430px]:grid-cols-2 sm:grid-cols-3 min-[886px]:grid-cols-4 min-[1060px]:grid-cols-5 place-items-center content-start gap-2 md:gap-4 px-2 mt-1 md:px-2 lg:px-3 py-2 custom-scrollbar overflow-y-auto overflow-x-hidden text-sm xl:text-base min-[1300px]:text-xl ${isDev && devBorder}`}>
                            {showMajors()}
                        </ul>
                    </div>
                    {errorMessage && (
                        <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
                    )}
                </div>
            }
            {chosenScheduleData && (
                renderChosenSchedule()
            )}
        </div>
    );
};

export default MajorSchedule;