"use client"
// Todo: trudne: Wybierz dzisiejszy dzień i może godzine domyślnie
import React, { useState, useEffect } from 'react';
import ErrorModal from '@/pages/ErrorModal';
import { useDev } from '@/contexts/DevContext';
import { MajorTypes, LessonTypes } from '@/types/type';
import { FaAngleLeft } from '@/assets/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';


function DynamicSearch() {
    const [data, setData] = useState<MajorTypes[]>();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [hourSuggestions, setHourSuggestions] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [dayInput, setDayInput] = useState<string>('');
    const [hoursInput, setHoursInput] = useState<string>('');
    const [results, setResults] = useState<LessonTypes[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [daysInSearchType, setDaysInSearchType] = useState<string[]>([])
    const [searchType, setSearchType] = useState<string | null>("")
    const { isDev } = useDev();

    const router = useRouter()
    const searchParams = useSearchParams()

    const colorsSmooth = "transition-colors duration-150"
    const optionsStyle = "md:w-72 lg:w-[25rem] text-3xl md:text-4xl lg:text-5xl px-2 py-1 md:text-lg text-black dark:text-white bg-white dark:bg-gray-900 shadow-md shadow-gray-400 disabled:shadow-black dark:shadow-[1px_2px_5px_1px_rgb(10,10,10)] rounded-md outline-none focus:border-gray-900 dark:focus:border-gray-400 border-2 border-transparent hover:scale-[1.05] transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-25";
    const inputStyles = "w-52 md:w-72 lg:w-[25rem] text-3xl md:text-4xl lg:text-5xl text-black dark:text-white dark:bg-gray-900 pl-2 rounded-md outline-none focus:border-gray-400 border-2 border-transparent placeholder:text-gray-500 dark:placeholder:text-white/65 hover:scale-[1.05] transition-all duration-150 shadow-md shadow-gray-400 dark:shadow-[1px_2px_5px_1px_rgb(10,10,10)]"

    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

    function resetInputs() {
        setSearchInput('');
        setDayInput('');
        setHoursInput('');
    }

    useEffect(() => {
        const searchType = searchParams.get("sT");
        console.log("Parametr sT:", searchType);
        setSearchType(searchType);
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
                    if (isDev) console.log("Przefiltrowane dane:", filteredData);

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
        resetInputs();
    }, []);

    useEffect(() => {
        const chosenTypeSet = new Set<string>();
        if (data) {
            Object.entries(data).forEach((major) => {
                const majorData = major[1] as MajorTypes;
                majorData.plan.forEach((day) => {
                    if (day) {
                        Object.entries(day).forEach(([, lekcja]) => {
                            const LessonTypes = lekcja as LessonTypes;
                            if (searchType === "p") {
                                const formattedPlace = formatPlace(LessonTypes.place);
                                chosenTypeSet.add(formattedPlace);
                            } else {
                                chosenTypeSet.add(LessonTypes.teacher);
                            }
                        });
                    }
                });
            });
            setSuggestions(Array.from(chosenTypeSet));
            if (isDev) console.log("Podpowiedzi:", Array.from(chosenTypeSet));
        }
    }, [data, searchType]);

    function formatPlace(place: string[] | object | undefined): string {
        if (!place) return "";
        if (Array.isArray(place)) {
            return place.join(" ");
        }
        return place.toString();
    }
    const dayOrderMap = daysOfWeek.reduce((acc, day, index) => {
        acc[day] = index;
        return acc;
    }, {} as Record<string, number>);

    function fetchChosenType(searchValue: string): (LessonTypes | string | null)[][] | null {
        const chosenTypeSet: (LessonTypes | string | null)[][] = [];
        setSearchInput(searchValue);
        const daysInSearchTypeSet = new Set<string>();

        if (searchValue.length >= 4 && data) {
            for (const [, major] of Object.entries(data)) {
                const majorData = major as MajorTypes;
                majorData.plan.forEach((day, dayIndex) => {
                    if (day.length > 0) {
                        for (const [, lekcja] of Object.entries(day)) {
                            const LessonTypes = lekcja as LessonTypes;
                            if (searchType == "p") {
                                if (formatPlace(LessonTypes.place) === searchValue) {
                                    chosenTypeSet.push([LessonTypes, daysOfWeek[dayIndex]]);
                                    if (isDev) console.log(majorData, daysOfWeek[dayIndex]);

                                    daysInSearchTypeSet.add(daysOfWeek[dayIndex])
                                }
                            } else {
                                if (LessonTypes.teacher === searchValue) {
                                    chosenTypeSet.push([LessonTypes, daysOfWeek[dayIndex]]);
                                    daysInSearchTypeSet.add(daysOfWeek[dayIndex])
                                }
                            }
                        }
                    }
                });
                const sortedDays = Array.from(daysInSearchTypeSet).sort((a, b) => {
                    return (dayOrderMap[a] || 0) - (dayOrderMap[b] || 0);
                });

                setDaysInSearchType(sortedDays);
            }
            if (chosenTypeSet.length > 0) {
                if (isDev) console.log("Lekcje posiadające określoną wartość:", chosenTypeSet);
                return chosenTypeSet;
            }
        }
        return null;
    }

    function fetchDay(dayInput: string): LessonTypes[] | null {
        const LessonTypesDetails: LessonTypes[] = [];
        const hoursSuggestions = new Set<string>();
        setDayInput(dayInput);
        // Todo pilne: Napraw resetowanie
        // setHoursInput("");

        if (searchInput.length > 2 && dayInput.length > 2) {
            const LessonTypess = fetchChosenType(searchInput);
            if (isDev) console.log("LessonTypess:", LessonTypess);

            if (LessonTypess) {
                LessonTypess.forEach((LessonTypes) => {
                    const [details, day] = LessonTypes as [LessonTypes, string];
                    if (day === dayInput) {
                        LessonTypesDetails.push(details);
                        const startTime = `${Math.floor(details.start_minute / 60)}:${details.start_minute % 60 === 0 ? '00' : details.start_minute % 60}`;
                        hoursSuggestions.add(startTime);
                    }
                });

                if (LessonTypesDetails.length != 0) {
                    if (isDev) console.log("Są niepuste wyniki");


                    const sortedHours = Array.from(hoursSuggestions).sort((a, b) => {
                        const [aHours, aMinutes] = a.split(':').map(Number);
                        const [bHours, bMinutes] = b.split(':').map(Number);
                        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
                    });
                    if (isDev) console.log(sortedHours);

                    setHourSuggestions(sortedHours);
                    if (isDev && hoursInput.length < 4) {
                        console.log("Lekcje spełniające warunki:", LessonTypesDetails);
                    }
                    return LessonTypesDetails;
                }
            } else {
                console.log("Wynik jest pusty");
                setErrorMessage("Brak wyników");
            }
        }
        return null;
    }

    function fetchHours(timeInput: string) {
        setHoursInput(timeInput);
        if (timeInput.length >= 4) {
            const LessonTypessData: LessonTypes[] | null = fetchDay(dayInput);
            const [hours, minutes] = timeInput.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes;
            const matchedLessonTypess = LessonTypessData?.filter(LessonTypes => {
                return typeof LessonTypes === 'object' && LessonTypes.start_minute == totalMinutes;
            }) as LessonTypes[];
            setResults(matchedLessonTypess || []);
            if (isDev) console.log("Znaleziona lekcja:", matchedLessonTypess);
            return totalMinutes;
        }
    }

    function handleCheck() {
        let errorMessages: string = "";
        if (!searchInput && !dayInput) {
            errorMessages = `Proszę wybrać ${searchType == 'p' ? "sale" : "wykładowce"} i dzień.`;
        } else if (!dayInput && !hoursInput) {
            errorMessages = "Proszę wybrać dzień i godzine.";
        } else if (!hoursInput && !searchInput) {
            errorMessages = `Proszę wybrać ${searchType == 'p' ? "sale" : "wykładowce"} i godzine.`;
        } else if (!searchInput) {
            errorMessages = `Proszę wybrać ${searchType == 'p' ? "sale" : "wykładowce"}.`;
        } else if (!dayInput) {
            errorMessages = "Proszę wybrać dzień.";
        } else if (!hoursInput) {
            errorMessages = "Proszę wybrać godzine.";
        }

        if (errorMessages.length > 0) {
            setErrorMessage(errorMessages);
        }

        if (results.length > 0) {
            console.log("Zdane");
        } else {
            setErrorMessage("Nie znaleziono wykładu dla podanych danych");
            console.log("Buda");
        }
    }

    function closeErrorModal() {
        setErrorMessage(null);
    }

    return (
        <div className={`h-screen bg-white dark:bg-gray-900 transition-colors duration-700 overflow-y-hidden ${isDev && "border"}`}>
            <div className={`relative h-full flex items-center justify-center flex-col gap-5 md:gap-10 ${isDev && "border border-black dark:border-white"}`}>
                <Link className={`absolute -top-1 left-2 text-3xl lg:text-4xl mt-4 text-black dark:text-white dark:shadow-gray-600 p-1 hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`} href={"/"}>
                    <FaAngleLeft />
                </Link>
                <div
                    className={`bg-transparent shadow-[1px_2px_10px_1px_rgb(225,225,225)] dark:shadow-[1px_2px_8px_1px_rgb(10,10,10)] dark:bg-gray-900 rounded-xl py-7 px-4 md:px-7 flex items-center justify-center flex-col gap-2 ${colorsSmooth} duration-700 ${isDev && "border border-black dark:border-white"}`}>
                    {/* Todo: resetowanie reszty pól gdy zmienia się wprowadzana wartość */}
                    <input
                        type="text"
                        placeholder={searchType == "p" ? "Numer sali" : "Wykładowca"}
                        className={`${inputStyles}`}
                        list="suggestions"
                        value={searchInput}
                        onChange={(e) => fetchChosenType(e.target.value)}
                    />
                    {searchType == "t" && searchInput.length > 2 && (
                        <datalist id="suggestions">
                            {suggestions.map((item, i) => (
                                <option key={i} value={item} />
                            ))}
                        </datalist>
                    )}
                    {searchType == "p" && searchInput.length > 1 && (
                        <datalist id="suggestions">
                            {suggestions.map((item, i) => (
                                <option key={i} value={item} />
                            ))}
                        </datalist>
                    )}
                    <select className={`${optionsStyle}`} onChange={(e) => fetchDay(e.target.value)}
                        disabled={searchInput.length < 3}>
                        <option hidden>Wybierz dzień</option>
                        {daysInSearchType.map((day, i) => (
                            <option key={i} value={day}>{day}</option>
                        ))}
                    </select>
                    <select className={`${optionsStyle}`} onChange={(e) => fetchHours(e.target.value)}
                        disabled={!dayInput}>
                        <option hidden>Wybierz godzine</option>
                        {hourSuggestions.map((hour, i) => (
                            <option key={i} value={hour}>Od {hour}</option>
                        ))}
                    </select>
                </div>
                {hoursInput.length < 1 ? (
                    <span className={`text-[32px] md:text-6xl px-7 py-1.5 rounded-lg focus:border-black focus:scale-[1.1] shadow-[0px_4px_10px_4px_rgb(150,150,150)] dark:shadow-[0px_2px_10px_2px_rgb(10,10,10)] transition-all duration-150 hover:scale-105 active:scale-100 cursor-not-allowed opacity-50 ${colorsSmooth} transition-transform`}>
                        <span className={`text-black dark:text-gray-200 ${colorsSmooth} `}>
                            Sprawdź
                        </span></span>
                ) : (
                    <Link
                        href={{
                            pathname: '/d-w/wynik',
                            query: {
                                sT: searchType,
                                v: searchInput,
                                d: dayInput,
                                h: hoursInput,
                            },
                        }}
                        onMouseOver={() => handleCheck()}
                        className={`cursor-pointer text-[32px] md:text-6xl px-7 py-1.5 rounded-lg focus:border-black focus:scale-[1.1] disabled:shadow-[0px_4px_10px_4px_rgb(150,150,150)] shadow-[0px_4px_10px_4px_rgb(225,225,225)] dark:shadow-[0px_2px_10px_2px_rgb(10,10,10)] transition-all duration-150 disabled:hover:scale-100 disabled:active:scale-100 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${colorsSmooth} transition-transform`}>
                        <span className={`text-black dark:text-gray-200 ${colorsSmooth} `}>
                            Sprawdź
                        </span>
                    </Link>
                )}
            </div>
            {errorMessage && (
                <ErrorModal message={errorMessage} onClose={closeErrorModal} />
            )}
        </div>
    );
}

export default DynamicSearch;
