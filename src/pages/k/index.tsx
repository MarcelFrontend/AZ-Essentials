// Todo: co: daj możliwość wpisania albo w innej formie pokazania najbliższych lekcji
// Todo: Pielęgniatstwo rok 2 niestacjonarne problem z sobotą
import { useDev } from '@/contexts/DevContext';
import { useData } from '@/contexts/DataFetchContext';
import ErrorModal from '@/pages/ErrorModal';
import React, { useCallback, useEffect, useState } from 'react';
import { MajorTypes } from '@/types/type';

import {
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
    IoFilter,
    FaComputer,
    FaSchool
} from '@/assets/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MajorSchedule() {
    const { data, setData } = useData();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [searchedMajor, setSearchedMajor] = useState<string>("");
    const [chosenScheduleData, setChosenScheduleData] = useState<MajorTypes | null>(null);
    const [showYearSelection, setShowYearSelection] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<string[]>();
    const [showFtMajors, setShowFtMajors] = useState<boolean>(true)
    const { isDev } = useDev();
    const router = useRouter();


    const colorsSmooth = "transition-colors duration-75";
    const shadowSmooth = "transition-shadow duration-[1.25s] delay-300 dark:duration-1000 dark:delay-100"
    const devBorder = "border border-black dark:border-white";
    const yearSelectionEl = "px-3 py-0.5 min-[480px]:px-3 min-[480px]:py-0.5  text-lg min-[480px]:text-base rounded-md cursor-pointer bg-gray-300 dark:bg-gray-700 transition-colors duration-100";
    const interStyles = "md:hover:scale-105 md:active:scale-95 transition-all duration-75"
    const majorYears = ["1", "2", "3"];

    useEffect(() => {
        console.clear();
        // if(window.innerWidth > )
        if (data) {
            if (isDev) console.log("Dane istnieją, nie trzeba ich pobierać:", data);
            setData(data);
            const majorNameSuggestions = new Set<string>()
            data.map(major => {
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
                    if (isDev) console.log("Przefiltrowane dane:", filteredData);
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
                        router.push("/")
                    }, 1000);
                }
            };
            console.clear();
            fetchData();
        }
    }, []);

    function fetchSearchedMajor(searchedMajor: string) {
        setSearchedMajor(searchedMajor);
        if (searchedMajor.length >= 2) {
            const resultMajors = new Set<MajorTypes>();

            data?.forEach(major => {
                if (major.name && major.name.toLowerCase().includes(searchedMajor.toLowerCase())) {
                    resultMajors.add(major);
                }
            });
            setData(Array.from(resultMajors));
        } else {
            setData([]);
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
        // Sortowanie według roku
        const sortedMajors = majors.sort((a, b) => {
            if (a.year && b.year) {
                if (a.year < b.year) return -1;
                if (a.year > b.year) return 1;
                return 0;
            } else {
                return 0;
            }
        });

        return sortedMajors.map((major, index) => {
            // Todo: dodaj wybór niestacjonarnych lub stacjonarnych
            if (major.name && major.year && major.type && (selectedYear === null || major.year == selectedYear)) {
                return (
                    <Link
                        href={{
                            pathname: '/k/wk',
                            query: {
                                wk: major.name,
                                wr: major.year
                            },
                        }}
                        onClick={() => setChosenScheduleData(major)} className={`relative h-36 w-full min-[1300px]:h-44 flex items-center justify-center flex-col gap-0.5 text-center px-2 py-1 text-black dark:text-white rounded-md shadow-[0px_2px_5px_2px_rgb(200,200,200)] dark:shadow-[0px_2px_10px_2px_rgb(5,5,5)] ${shadowSmooth} ${isDev && devBorder} transition-colors duration-500 ${interStyles}`}
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
                    </Link>
                );
            }
            return null;
        });
    }

    const showMajors = useCallback(() => {
        if (data && searchedMajor.length >= 2) {
            if (isDev) console.log("To się wywoła potem");
            return getMajors(data);
        } else {
            if (isDev) console.log("To się wywoła kiedy zmienimy selectedYear:", selectedYear);
            // Todo: Dodaj filtracje na stacjonarne i nie stacjonarne
            if (data) return getMajors(data);
        }
    }, [data, selectedYear, showFtMajors]);

    return (
        <div className={`relative h-[87.5vh] md:h-[93vh] flex items-center flex-col overflow-hidden ${isDev && devBorder}`}>
            <div className={`relative w-screen h-fit flex items-center md:py-1 px-2 shadow-[0px_1px_10px_1px_rgb(225,225,225)] dark:shadow-[0px_1px_10px_1px_rgb(10,10,10)] ${shadowSmooth}`}>
                {!chosenScheduleData && (
                    <div className='relative w-full flex items-center gap-5 pr-5 md:pr-2'>
                        {/* Wszysktie kierunki */}
                        <Link className={`text-3xl md:text-4xl lg:text-4xl text-black dark:text-white dark:shadow-gray-600 hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`} href="/">
                            <FaAngleLeft />
                        </Link>
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
                        {showFtMajors ? (
                            <FaComputer title='Pokaż stacjonarne' onClick={() => setShowFtMajors(false)} className={`text-3xl xl:text-4xl text-black dark:text-white transition-colors duration-100 cursor-pointer ${interStyles}`} />
                        ) : (
                            <FaSchool title='Pokaż niestacjonarne' onClick={() => setShowFtMajors(true)} className={`text-3xl xl:text-4xl text-black dark:text-white transition-colors duration-100 cursor-pointer ${interStyles}`} />
                        )}
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
                )}
            </div>
            {!chosenScheduleData &&
                <div className='w-full flex items-center justify-center flex-col overflow-y-hidden'>
                    <div className={`w-full h-full flex items-center justify-center flex-col sm:rounded-lg overflow-hidden sm:mb-1 ${isDev && devBorder}`}>
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
        </div>
    );
};