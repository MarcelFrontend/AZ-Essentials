import { useDev } from '@/contexts/DevContext';
import { LessonTypes, MajorTypes } from '@/types/type';
import React, { useEffect, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6';

interface ScheduleModalProps {
    data: MajorTypes | undefined;
}

export default function ScheduleModal({ data }: ScheduleModalProps) {
    const [devWidth, setDevWidth] = useState<number>(0);
    const { isDev } = useDev();
    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', "Sobota", "Niedziela"];
    const [lessonsInCol, setLessonsInCol] = useState<number>(1);
    const [showDays, setShowDays] = useState<boolean[]>(() => {
        const initialShowDays = Array(daysOfWeek.length).fill(false);
        if (new Date().getDay() - 1 >= 0) {
            initialShowDays[new Date().getDay() - 1] = true;

        }
        return initialShowDays;
    });

    // risizing
    useEffect(() => {
        setDevWidth(window.innerWidth)
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

    const formatTime = (time: number) =>
        `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;


    function renderDayName(dayIndex: number) {
        return <div className="flex px-2 text-black dark:text-white border bg-gray-100 dark:bg-gray-900  dark:border-gray-950 rounded-lg py-1 shadow-[0px_1px_3px_1px_rgb(150,150,150)] dark:shadow-[0px_1px_3px_1px_rgb(0,0,0)]">
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
                        className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'min-h-14 max-h-[90%]' : 'md:h-[21.5rem] md:min-h-[99%] lg:h-[26rem]'} flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto py-1 px-1`}
                    >
                        {renderDayName(dayIndex)}
                        {showDays[dayIndex] && (
                            <div
                                className={`max-h-full grid ${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'grid-cols-2' : 'min-[500px]:grid-cols-2'
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
                className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'min-h-14 max-h-[79%]' : 'md:h-[21.5rem] md:min-h-[99%] lg:h-[26rem]'} xl:h-min flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto px-2 py-1`}
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
            <p className="w-40 md:w-48">{lesson.teacher}</p>
            <span>
                {formatTime(lesson.start_minute)}-{formatTime(lesson.end_minute)}
            </span>
            <p>{lesson.place}</p>
        </div>
    }

    if (typeof data == 'undefined') return <div className='w-full h-full flex items-center justify-center bg-black/75'>
        <span className='w-96 h-96 flex items-center justify-center font-bold'>
            Błąd przy wczytywaniu danych
        </span>
    </div>

    const notEmptyDaysNum = data.plan.filter(day => day.length > 0).length;

    if (isDev) console.log("Niepuste dni:", notEmptyDaysNum);
    if (notEmptyDaysNum < lessonsInCol) setLessonsInCol(notEmptyDaysNum);

    return (
        <ul
            style={{ gridTemplateColumns: `repeat(${lessonsInCol}, 1fr)` }}
            className={`transition-colors duration-150 w-full h-full grid content-start gap-1 overflow-y-hidden px-2 py-1 md:pb-0 bg-gray-200 dark:bg-gray-900 rounded-lg ${isDev && "border border-black dark:border-white"}`}>
            {data.plan.map((day, index) => {
                if (!Array.isArray(day) || day.length === 0) return null;
                return renderDay(day, index);
            })}
        </ul>
    );
};
