import React, { useState, useEffect } from 'react';
import data from '../../public/database.json';
import Head from 'next/head';
import ErrorModal from '@/pages/ErrorModal';

interface Lesson {
    place: string;
    name: string;
    start_minute: number;
    end_minute: number;
    duration: number;
    whatever: string;
    type: string;
    teacher: string;
    subject: string;
    dates: string[];
}

interface MajorTypes {
    degree: string | null;
    doc_type: number;
    groups: string[];
    name: string | null;
    plan: Lesson[][];
    semester: string | null;
    type: string | null;
    year: number | null;
}

interface DynamicSearchProps {
    returnToMenu: () => void;
    searchType: 'teacher' | 'place';
}

function DynamicSearch({ returnToMenu, searchType }: DynamicSearchProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [hourSuggestions, setHourSuggestions] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [dayInput, setDayInput] = useState<string>('');
    const [hoursInput, setHoursInput] = useState<string>('');
    const [results, setResults] = useState<Lesson[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const colorsSmooth = "transition-colors duration-150"
    const optionsStyle = "text-3xl px-2 py-1 md:text-lg text-black dark:text-white bg-white dark:bg-gray-700 shadow-md dark:shadow-black rounded-md outline-none focus:border-gray-900 dark:focus:border-gray-400 border-2 border-transparent hover:scale-[1.05] transition-all duration-75 cursor-pointer"
    const days = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

    function resetInputs() {
        setSearchInput('');
        setDayInput('');
        setHoursInput('');
    }

    useEffect(() => {
        resetInputs();
        console.clear();
        setSearchInput("");
        setDayInput("");
        setHoursInput("");

        const chosenTypeSet = new Set<string>();

        Object.entries(data).forEach((major) => {
            const majorData = major[1] as MajorTypes;
            majorData.plan.forEach((day) => {
                if (day) {
                    Object.entries(day).forEach(([, lekcja]) => {
                        const lesson = lekcja as Lesson;
                        if (searchType == "place") {
                            if (lesson.place != null)
                                chosenTypeSet.add(lesson.place[0] + ' ' + lesson.place[1]);
                        } else {
                            if (lesson.teacher != null)
                                chosenTypeSet.add(lesson.teacher);
                        }
                    });
                }
            });
        });

        setSuggestions(Array.from(chosenTypeSet));
    }, []);

    function fetchChosenType(searchValue: string): (Lesson | string | null)[][] | null {
        const chosenTypeSet: (Lesson | string | null)[][] = [];
        setSearchInput(searchValue);

        if (searchValue.length >= 4) {
            for (const [, major] of Object.entries(data)) {
                const majorData = major as MajorTypes;
                majorData.plan.forEach((day, dayIndex) => {
                    if (day.length > 0) {
                        for (const [, lekcja] of Object.entries(day)) {
                            const lesson = lekcja as Lesson;
                            if (searchType == 'place') {
                                if (lesson.place === searchValue) {
                                    chosenTypeSet.push([lesson, days[dayIndex]]);
                                }
                            } else {
                                if (lesson.teacher === searchValue) {
                                    chosenTypeSet.push([lesson, days[dayIndex]]);
                                }
                            }
                        }
                    }
                });
            }

            if (chosenTypeSet.length > 0) {
                return chosenTypeSet;
            }
        }

        return null;
    }

    function fetchDay(dayInput: string): Lesson[] | null {
        const lessonDetails: Lesson[] = [];
        const hoursSuggestions = new Set<string>();
        setDayInput(dayInput);

        if (searchInput.length > 2 && dayInput.length > 2) {
            const lessons = fetchChosenType(searchInput);

            if (lessons) {
                lessons.forEach((lesson) => {
                    const [details, day] = lesson as [Lesson, string];
                    if (day === dayInput) {
                        lessonDetails.push(details);
                        const startTime = `${Math.floor(details.start_minute / 60)}:${details.start_minute % 60 === 0 ? '00' : details.start_minute % 60}`;
                        hoursSuggestions.add(startTime);
                    }
                });

                if (lessonDetails.length > 0) {
                    const sortedHours = Array.from(hoursSuggestions).sort((a, b) => {
                        const [aHours, aMinutes] = a.split(':').map(Number);
                        const [bHours, bMinutes] = b.split(':').map(Number);
                        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
                    });

                    setHourSuggestions(sortedHours);
                    return lessonDetails;
                }
            } else {
                alert("Brak wyników");
            }
        }
        return null;
    }

    function fetchHours(timeInput: string) {
        setHoursInput(timeInput);
        if (timeInput.length >= 4) {
            const lessonsData: Lesson[] | null = fetchDay(dayInput);
            const [hours, minutes] = timeInput.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes;
            const matchedLessons = lessonsData?.filter(lesson => {
                return typeof lesson === 'object' && lesson.start_minute === totalMinutes;
            }) as Lesson[];
            setResults(matchedLessons || []);
            return totalMinutes;
        }
    }

    function handleCheck() {
        let errorMessages: string = "";

        if (!searchInput && !dayInput && !hoursInput) {
            errorMessages = "Proszę wypełnić wszystkie pola.";
        } else if (!searchInput && !dayInput) {
            errorMessages = `Proszę wybrać ${searchType == 'place' ? "sale" : "wykładowce"} i dzień.`;
        } else if (!dayInput && !hoursInput) {
            errorMessages = "Proszę wybrać dzień i godzine.";
        } else if (!hoursInput && !searchInput) {
            errorMessages = `Proszę wybrać ${searchType == 'place' ? "sale" : "wykładowce"} i godzine.`;
        } else if (!searchInput) {
            errorMessages = `Proszę wybrać ${searchType == 'place' ? "sale" : "wykładowce"}.`;
        } else if (!dayInput) {
            errorMessages = "Proszę wybrać dzień.";
        } else if (!hoursInput) {
            errorMessages = "Proszę wybrać godzine.";
        }

        if (errorMessages.length > 0) {
            setErrorMessage(errorMessages);
            return;
        }

        if (results.length > 0) {
            setShowResults(true);
        } else {
            setErrorMessage("Nie znaleziono wykładu dla podanych danych");
        }
    }

    function closeErrorModal() {
        setErrorMessage(null);
    }

    function goBack() {
        setShowResults(false);
        setResults([]);
        setDayInput("");
        setHoursInput("");
        setSearchInput("");
    }

    function formatResult() {
        function formatTime(time: number) {
            return `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;
        }

        const paddingTop = `${results.length * 3}rem`;

        return (
            <div className="h-[93vh] flex items-center justify-center">
                <ul className={`relative -top-9 sm:top-0 h-3/4 flex items-center justify-center flex-col gap-2 overflow-y-auto overflow-x-hidden px-1.5 pb-1.5 custom-scrollbar`} style={{ paddingTop }}>
                    {results.map((lesson, index) => (
                        <li key={index} className='w-[21rem] border-2 border-gray-500 text-center dark:border-slate-600 text-black dark:text-white bg-gray-200 dark:bg-black rounded-lg flex items-center flex-col py-3 mr-1 text-2xl shadow-md shadow-gray-400 dark:shadow-gray-800 transition-all hover:scale-[1.03] duration-100'>
                            <span>{dayInput} <span className={searchType == "place" ? "font-bold" : ""}>{lesson.place}</span></span>
                            <span className={searchType == "place" ? "" : "font-bold"}>{lesson.teacher}</span>
                            <span>
                                {formatTime(lesson.start_minute)} - {formatTime(lesson.end_minute)}
                            </span>
                            <span>{lesson.subject}</span>
                            <span>
                                {lesson.type} {lesson.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className='bg-gray-100 dark:bg-gray-950 transition-colors duration-700'>
            <Head>
                <title>Kto ma w ...?</title>
            </Head>
            {showResults && results.length > 0 && (
                <button className='relative top-2 sm:top-1 text-black dark:text-white border-2 border-black dark:border-white rounded-md text-2xl md:text-lg px-4 md:px-3 mt-2 ml-2 hover:scale-105 active:scale-95 transition-transform duration-150' onClick={goBack}>Wróć</button>
            )}
            {!showResults && (
                <div className="h-screen flex items-center justify-center flex-col gap-5">
                    <button
                        onClick={returnToMenu}
                        className={`absolute -top-1 left-2 text-2xl mt-4 border-2 border-gray-400 text-black dark:text-white dark:shadow-gray-600 py-1 px-5 rounded-lg hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`}>
                        Cofnij
                    </button>
                    <div className={`bg-gray-300/50 dark:bg-gray-800/75 rounded-xl py-7 px-4 flex items-center justify-center flex-col gap-2 ${colorsSmooth} duration-700`}>
                        {/* Todo: resetowanie reszty pól gdy zmienia się sala */}
                        <input
                            type="text"
                            placeholder={searchType == "place" ? "Numer sali" : "Wykładowca"}
                            className={`w-52 text-3xl sm:text-2xl text-black dark:text-white dark:bg-gray-700 pl-2 rounded-md outline-none focus:border-gray-400 border-2 border-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400 hover:scale-[1.05] transition-all duration-150 shadow-md dark:shadow-black`}
                            list="suggestions"
                            value={searchInput}
                            onChange={(e) => fetchChosenType(e.target.value)}
                        />
                        {searchInput.length > 1 && (
                            <datalist id="suggestions">
                                {suggestions.map((item, i) => (
                                    <option key={i} value={item} />
                                ))}
                            </datalist>
                        )}
                        <select className={`${optionsStyle} disabled:cursor-not-allowed`} onChange={(e) => fetchDay(e.target.value)}
                            disabled={searchInput == ""}
                        >
                            <option hidden>Wybierz dzień</option>
                            {days.map((day, i) => (
                                <option key={i} value={day}>{day}</option>
                            ))}
                        </select>
                        <select className={`${optionsStyle} disabled:cursor-not-allowed`} onChange={(e) => fetchHours(e.target.value)}
                            disabled={!dayInput}
                        >
                            <option hidden>Wybierz godzine</option>
                            {hourSuggestions.map((hour, i) => (
                                <option key={i} value={hour}>Od {hour}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className={`text-3xl px-5 py-1 rounded-lg border-2 border-gray-500 dark:border-gray-500 focus:border-black focus:scale-[1.1] bg-gray-300 dark:bg-gray-700 transition-transform duration-150 hover:scale-105 active:scale-95 ${colorsSmooth}`}
                        onClick={handleCheck}
                    >
                        <span className={`text-black dark:text-white ${colorsSmooth}`}>
                            Sprawdź
                        </span>
                    </button>
                </div>
            )}
            {showResults && results.length > 0 && (
                formatResult()
            )}
            {errorMessage && (
                <ErrorModal message={errorMessage} onClose={closeErrorModal} />
            )}
        </div>
    );
}

export default DynamicSearch;
