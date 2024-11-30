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
import { FaQuestion } from 'react-icons/fa6';
import Head from 'next/head';

export default function MajorSchedule() {
    const { data, fetchData } = useData();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [searchedMajor, setSearchedMajor] = useState<string>("");
    const [searchedMajorData, setSearchedMajorData] = useState<MajorTypes[] | null>();
    const [showFilterSettings, setShowFilterSettings] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<string[]>();
    const [showFtMajors, setShowFtMajors] = useState<boolean | null>(null)
    const { isDev } = useDev();

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
            const majorNameSuggestions = new Set<string>()
            data.map(major => {
                if (major.name) majorNameSuggestions.add(major.name)
            })
            setSuggestions(Array.from(majorNameSuggestions))
        } else {
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
                return <GiAngelOutfit className='text-yellow-300 dark:text-yellow-200' />
            case "Rynek sztuki i zarządzanie w kulturze":
                return <FaImages className='text-purple-400 dark:text-purple-300' />
            case "Fizjoterapia":
                return <FaDumbbell className='text-stone-400 dark:text-sky-600' />
            case "Ratownictwo medyczne":
                return <FaAmbulance className='text-red-600 dark:text-red-400' />
            case "Turystyka i rekreacja":
                return <FaMapMarkedAlt className='text-blue-500 dark:text-blue-400' />
            case "Informatyka":
                return <HiCommandLine className='text-emerald-500 dark:text-green-400' />
            case "Mechanika i budowa maszyn":
                return <MdEngineering />
            case "Położnictwo":
                return <FaUserNurse className='text-pink-500 dark:text-pink-400' />
            case "Pedagogika":
                return <FaChalkboardTeacher className='text-violet-500 dark:text-violet-400' />
            case "Finanse i rachunkowość":
                return <FaCoins />
            case "Prawo":
                return <GoLaw className='text-sky-500 dark:text-sky-200' />
            case "Bezpieczeństwo narodowe":
                return <FaShieldAlt className='text-blue-300 dark:text-blue-700' />
            case "Logistyka":
                return <FaToilet className='text-neutral-500' />
            case "Filologia angielska":
                return <FaBookOpen className='text-rose-400 dark:text-teal-300' />
            case "Filologia w zakresie filologii angielskiej":
                return <FaBookOpen className='text-rose-400 dark:text-teal-300' />
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

        function getSearchedMajor(major: MajorTypes, index: number) {
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
                    key={index}
                    className={`relative h-36 w-full min-[1300px]:h-44 flex items-center justify-center flex-col gap-0.5 text-center px-2 py-1 text-black dark:text-white rounded-md shadow-[0px_2px_5px_2px_rgb(200,200,200)] dark:shadow-[0px_2px_10px_2px_rgb(5,5,5)] ${shadowSmooth} ${isDev && devBorder} transition-colors duration-500 ${interStyles}`}>
                    <div className='absolute top-1 right-1 text-3xl md:text-4xl 2xl:text-5xl'>
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

        return sortedMajors.map((major, index) => {
            // Todo: dodaj wybór niestacjonarnych lub stacjonarnych
            if (major.name && major.year && major.type && (selectedYear === null || major.year == selectedYear)) {
                if (showFtMajors === null) {
                    return getSearchedMajor(major, index)
                } else if (showFtMajors == true) {
                    if (major.type.trim().toLowerCase() == "ogólna" || major.type.trim().toLowerCase() == "stacjonarne") {
                        // console.log(major.type, numOfMajorTypes);
                        return getSearchedMajor(major, index)
                    }
                } else {
                    if (major.type.trim().toLowerCase() == "niestacjonarne") {
                        // console.log(major.type, numOfMajorTypes);
                        return getSearchedMajor(major, index)
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
        <div className={`relative h-dvh md:h-screen flex items-center flex-col overflow-hidden ${isDev && devBorder}`}>
            <Head>
                <title>Kierunki</title>
            </Head>
            <div className={`relative w-screen h-14 flex items-center md:py-1 px-2 shadow-[0px_1px_10px_1px_rgb(225,225,225)] dark:shadow-[0px_1px_10px_1px_rgb(10,10,10)] ${shadowSmooth}`}>
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
            </div>
            <div className='w-full flex items-center justify-center flex-col overflow-y-hidden'>
                <div className={`w-full h-full flex items-center justify-center flex-col sm:rounded-sm overflow-hidden sm:mb-1  ${isDev && devBorder}`}>
                    {/* min-[1893px]:w-fit */}
                    <ul className={`w-full grid grid-cols-2 min-[430px]:grid-cols-2 sm:grid-cols-3 min-[886px]:grid-cols-4 min-[1060px]:grid-cols-5 place-items-center content-start gap-2 md:gap-4 px-2 sm:px-3 md:px-2 lg:px-5 py-2 lg:pb-6 mt-1 custom-scrollbar overflow-y-auto overflow-x-hidden text-sm xl:text-base min-[1300px]:text-xl ${isDev && devBorder}`}>
                        {showMajors()}
                    </ul>
                </div>
                {errorMessage && (
                    <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
                )}
            </div>
        </div>
    );
};