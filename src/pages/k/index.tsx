// Todo: co: daj możliwość wpisania albo w innej formie pokazania najbliższych lekcji
// Todo: Pielęgniatstwo rok 2 niestacjonarne problem z sobotą
// Todo: Dodać zapamiętywanie preferencji
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
import { FaQuestion } from 'react-icons/fa6';

export default function MajorSchedule() {
    const { data, setData } = useData();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [searchedMajor, setSearchedMajor] = useState<string>("");
    const [searchedMajorData, setSearchedMajorData] = useState<MajorTypes[] | null>();
    const [chosenScheduleData, setChosenScheduleData] = useState<MajorTypes | null>(null);
    const [showFilterSettings, setShowFilterSettings] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<string[]>();
    const [showFtMajors, setShowFtMajors] = useState<boolean | null>(null)
    const { isDev } = useDev();
    const router = useRouter();

    const colorsSmooth = "transition-colors duration-75";
    const shadowSmooth = "transition-shadow duration-[1.25s] delay-300 dark:duration-1000 dark:delay-100"
    const devBorder = "border border-black dark:border-white";
    const yearSelectionEl = "rounded-md cursor-pointer bg-gray-300 dark:bg-gray-700 transition-colors duration-100";
    const interStyles = "md:hover:scale-105 md:active:scale-95 transition-all duration-75"
    const majorYears = ["1", "2", "3"];
    const mjStyles = `flex items-center gap-2 bg-gray-700 outline-none px-2 rounded-md ${interStyles}`
    const mTBtnStyles = 'hidden md:block text-4xl xl:text-5xl text-black dark:text-white transition-colors duration-100 cursor-pointer'
    const mTTStyles = 'text-2xl md:text-sm px-2 py-0.5 rounded-md text-black dark:text-white'

    // fetching data
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
                    if (isDev) console.log(jsonData);
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
        setSearchedMajorData([])
        if (searchedMajor.length >= 2) {
            const resultMajors = new Set<MajorTypes>();
            if (data) {
                data?.forEach(major => {
                    if (major.name && major.name.toLowerCase().trim().includes(searchedMajor.toLowerCase().trim())) {
                        if (isDev) console.log(major);
                        resultMajors.add(major);
                    }
                });
                setSearchedMajorData(Array.from(resultMajors));
            } else {
                alert("Nie ma danych")
            }
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
            case "Filologia w zakresie filologii angielskiej":
                return <FaBookOpen />
            default:
                <FaQuestion />
                break;
        }
    }

    function getMajors(majors: MajorTypes[]) {
        const sortedMajors = majors.sort((a, b) => {
            const yearA = a.year || Infinity;
            const yearB = b.year || Infinity;

            if (yearA < yearB) return -1;
            if (yearA > yearB) return 1;
            return 0;
        });


        function getSearchedMajor(major: MajorTypes) {
            return (
                <Link
                    href={{
                        pathname: '/k/wk',
                        query: {
                            k: major.name,
                            r: major.year,
                            t: major.type
                        },
                    }}
                    onClick={() => setChosenScheduleData(major)} className={`relative h-36 w-full min-[1300px]:h-44 flex items-center justify-center flex-col gap-0.5 text-center px-2 py-1 text-black dark:text-white rounded-md shadow-[0px_2px_5px_2px_rgb(200,200,200)] dark:shadow-[0px_2px_10px_2px_rgb(5,5,5)] ${shadowSmooth} ${isDev && devBorder} transition-colors duration-500 ${interStyles}`}>
                    <div className='absolute top-1 right-1 text-3xl md:text-4xl'>
                        {major.name && getMajorIcon(major.name)}
                    </div>
                    <span className='absolute top-1 left-1'>
                        {major.groups[0]}
                    </span>
                    <span className='w-[90%] min-[1300px]:w-[60%]'>
                        {major.name}
                    </span>
                    <span>
                        {major.type}
                    </span>
                </Link>
            )
        }

        return sortedMajors.map(major => {
            // Todo: dodaj wybór niestacjonarnych lub stacjonarnych
            if (major.name && major.year && major.type && (selectedYear === null || major.year == selectedYear)) {
                if (showFtMajors === null) {
                    return getSearchedMajor(major)
                } else if (showFtMajors == true) {
                    if (major.type.trim().toLowerCase() == "ogólna" || major.type.trim().toLowerCase() == "stacjonarne") {
                        // console.log(major.type, numOfMajorTypes);
                        return getSearchedMajor(major)
                    }
                } else {
                    if (major.type.trim().toLowerCase() == "niestacjonarne") {
                        // console.log(major.type, numOfMajorTypes);
                        return getSearchedMajor(major)
                    }
                }

            }
            return null;
        });
    }

    const showMajors = useCallback(() => {
        if (searchedMajorData && searchedMajor.length >= 2) {
            if (isDev) console.log("'" + searchedMajor + "'", searchedMajor.length);
            if (isDev) console.log("To się wywoła po zmianie searchedMajor:", data);
            return getMajors(searchedMajorData);
        } else {
            if (isDev) console.log("To się wywoła kiedy zmienimy selectedYear:", selectedYear);
            if (data) return getMajors(data);
        }
    }, [data, searchedMajorData, selectedYear, showFtMajors]);

    return (
        <div className={`relative h-[92vh] sm:h-screen flex items-center flex-col overflow-hidden ${isDev && devBorder}`}>
            <head>
                <title>Kierunki</title>
            </head>
            <div className={`relative w-screen h-14 flex items-center md:py-1 px-2 shadow-[0px_1px_10px_1px_rgb(225,225,225)] dark:shadow-[0px_1px_10px_1px_rgb(10,10,10)] ${shadowSmooth}`}>
                {!chosenScheduleData && (
                    <div className='relative w-full flex items-center gap-5 pr-5 md:pr-2'>
                        <Link className={`text-3xl md:text-4xl sm:text-4xl text-black dark:text-white dark:shadow-gray-600 hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`} href="/">
                            <FaAngleLeft />
                        </Link>
                        <div className='w-full flex justify-center'>
                            <input value={searchedMajor} onChange={(e) => fetchSearchedMajor(e.target.value)} className={`w-3/4 pl-2 py-1 md:py1.5 mt-2 mb-1.5 text-lg md:text-xl 2xl:text-2xl bg-transparent border-2 border-gray-700 rounded-md outline-none focus:border-gray-200 dark:focus:border-gray-400 shadow-[inset_1px_1px_6px_1px_rgb(225,225,225)] dark:shadow-[inset_1px_1px_6px_1px_rgb(10,10,10)] text-black dark:text-white ${shadowSmooth}`} type="text" placeholder='Wpisz kierunek' list='suggestions' />
                            {searchedMajor.length > 1 && (
                                <datalist id="suggestions">
                                    {suggestions?.map((item, i) => (
                                        <option key={i} value={item} />
                                    ))}
                                </datalist>
                            )}
                        </div>
                        <IoFilter title='Wybierz rok do wyświetlenia' onClick={() => setShowFilterSettings(!showFilterSettings)} className={`text-4xl xl:text-5xl text-black dark:text-white transition-colors duration-100 cursor-pointer ${interStyles}`} />
                        {showFilterSettings && (
                            <ul className={`absolute right-4 top-14 max-w-min flex flex-col gap-3 items-center bg-white dark:bg-gray-900 z-10 p-2 rounded-xl transition-colors duration-[2s] shadow-[inset_0px_0px_10px_2px_rgb(27,34,49)] border-gray-800`}>
                                <li className='flex items-center justify-center flex-col'>
                                    <span className={`text-2xl sm:text-3xl mb-1 text-black dark:text-white ${colorsSmooth}`}>Wybierz rok</span>
                                    <ul className='w-40 flex flex-col gap-1.5'>
                                        <li
                                            onClick={() => { setSelectedYear(null); setTimeout(() => { setShowFilterSettings(false) }, 100) }}
                                            className={`${yearSelectionEl} ${interStyles} 
                                            ${selectedYear == null ? "bg-gray-600 dark:bg-white text-white dark:text-black" : "text-black dark:text-white "}`}>
                                            <span className={`${selectedYear == null ? "text-white dark:text-black" : "text-black dark:text-white "} text-2xl flex justify-center`}>
                                                Wszystkie
                                            </span>
                                        </li>
                                        <div className='w-full flex items-center justify-center gap-1.5'>
                                            {majorYears.map((year, index) => (
                                                <li
                                                    onClick={() => { setSelectedYear(year); setTimeout(() => { setShowFilterSettings(false) }, 100) }}
                                                    key={index}
                                                    className={`${yearSelectionEl} ${interStyles} text-center w-full py-[3px]
                                            ${selectedYear == year && "bg-gray-600 dark:bg-white"} ${colorsSmooth}`}>
                                                    <span className={`${selectedYear == year ? "text-white dark:text-black " : "text-black dark:text-white"} ${colorsSmooth} text-xl`}>
                                                        {year}
                                                    </span>
                                                </li>
                                            ))}
                                        </div>
                                    </ul>
                                </li>
                                <li className='flex justify-center items-center flex-col'>
                                    <span className={`text-center text-2xl sm:text-3xl mb-1 text-black dark:text-white leading-6 md:leading-8 ${colorsSmooth}`}>
                                        Wybierz typ studiów
                                    </span>
                                    <div className='flex items-center flex-col'>
                                        {showFtMajors ? (
                                            <button onClick={() => { setShowFtMajors(false); setTimeout(() => { setShowFilterSettings(false) }, 100) }}
                                                className={mjStyles}>
                                                <FaComputer className={mTBtnStyles} />
                                                <span className={mTTStyles}>Na wynos</span>
                                            </button>
                                        ) : (
                                            <button onClick={() => { setShowFtMajors(true); setTimeout(() => { setShowFilterSettings(false) }, 100) }}
                                                className={mjStyles}>
                                                <FaSchool className={mTBtnStyles} />
                                                <span className={mTTStyles}>Na miejscu</span>
                                            </button>
                                        )}
                                    </div>
                                </li>
                            </ul>
                        )}
                    </div>
                )}
            </div>
            {!chosenScheduleData &&
                <div className='w-full flex items-center justify-center flex-col overflow-y-hidden'>
                    <div className={`w-full h-full flex items-center justify-center flex-col sm:rounded-sm overflow-hidden sm:mb-1 ${isDev && devBorder}`}>
                        {/* min-[1893px]:w-fit */}
                        <ul className={`w-full grid grid-cols-2 min-[430px]:grid-cols-2 sm:grid-cols-3 min-[886px]:grid-cols-4 min-[1060px]:grid-cols-5 place-items-center content-start gap-2 md:gap-4 px-2 mt-1 md:px-2 sm:px-3 py-2 custom-scrollbar overflow-y-auto overflow-x-hidden text-sm xl:text-base min-[1300px]:text-xl ${isDev && devBorder}`}>
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