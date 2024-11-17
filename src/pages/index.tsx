import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { MajorTypes } from '@/types/type';
import { useData } from '@/contexts/DataFetchContext';
import { MdAutoFixNormal, MdAutoFixOff, FaPersonCircleQuestion, FaCalendarDays, FaDoorOpen } from '@/assets/icons'
import { IconType } from "react-icons";
import Link from "next/link";

function Index() {
  const { data, setData } = useData()
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [animationPreference, setAnimationPreference] = useState<boolean>(true);
  const [animShowed, setAnimShowed] = useState<boolean>(false);
  const handleAnimationEnd = () => {
    setAnimShowed(true);
    sessionStorage.setItem("azAnim", 'true');
  };

  function updateAnimationPreference() {
    const newAnimationPreference = !animationPreference;
    setAnimationPreference(newAnimationPreference);
    localStorage.setItem("az-anim", String(newAnimationPreference));
  }

  const colorsSmooth = "transition-colors duration-100";

  useEffect(() => {
    console.clear();
    const animationPreference = localStorage.getItem("az-anim");

    if (animationPreference === 'false') {
      setAnimationPreference(false);
    } else {
      setAnimationPreference(true);
    }
    if (!data) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('https://maramowicz.dev/azapi/database.json');
          if (!response.ok) throw new Error("Nie udało się pobrać danych");
          const jsonData: MajorTypes[] = await response.json();
          setData(jsonData)
          console.log("Po pobraniu danych:", jsonData);
        } catch (error) {
          console.error(error);
          setData(null)
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      console.log("Dane istniały");
    }
  }, []);

  function ListEl({ icon: Icon, mainTask, taskDesc, index }: { icon: IconType, mainTask: string, taskDesc: string, index: number }) {
    return (
      <>
        {(animationPreference && animShowed == false) ? (
          <motion.li
            initial={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              delay: index / 2 + 1.2
            }}
            onAnimationComplete={() => index == 2 && animationPreference && handleAnimationEnd()}
            className={`relative md:min-h-48 md:w-52 lg:w-72 flex items-center flex-row md:flex-col gap-2 text-center px-4 py-1.5 md:py-5 rounded-2xl md:rounded-xl transition-shadow duration-1000 delay-500 dark:duration-1000 dark:delay-100 shadow-[0px_2px_7px_1px_rgb(200,200,200)] dark:shadow-[0px_3px_3px_1px_rgb(10,10,10)] hover:bg-gray-100/75 dark:hover:bg-gray-800/50 cursor-pointer`}
          >
            <Icon className={`text-2xl md:text-3xl text-black dark:text-white transition-colors duration-[2.25s]`} />
            <span className={`font-bold md:text-xl text-black dark:text-white transition-colors duration-[2.25s]`}>
              {mainTask}
            </span>
            <p className={`hidden md:block w-55 text-xs md:text-sm md:leading-[19px
            lg:text-lg lg:leading-[24px] text-gray-600 dark:text-gray-400 transition-colors duration-[2.5s]`}>
              {taskDesc}
            </p>
          </motion.li>
        ) : (
          <li
            className={`relative md:min-h-48 md:w-52 lg:w-72 flex items-center flex-row md:flex-col gap-2 text-center px-4 py-1.5 md:py-5 rounded-2xl md:rounded-xl transition-shadow duration-1000 delay-500 dark:duration-1000 dark:delay-100 shadow-[0px_2px_7px_1px_rgb(200,200,200)] dark:shadow-[0px_3px_3px_1px_rgb(10,10,10)] hover:bg-gray-100/75 dark:hover:bg-gray-800/50 cursor-pointer`}
          >
            <Icon className={`text-2xl md:text-3xl text-black dark:text-white transition-colors duration-[2.25s]`} />
            <span className={`font-bold md:text-xl text-black dark:text-white transition-colors duration-[2.25s]`}>
              {mainTask}
            </span>
            <p className={`hidden md:block w-55 text-xs md:text-sm md:leading-[19px
            lg:text-lg lg:leading-[24px] text-gray-600 dark:text-gray-400 transition-colors duration-[2.5s]`}>
              {taskDesc}
            </p>
          </li>
        )}
      </>
    );
  }

  return (
    <div className="h-[92vh] sm:h-screen flex items-center justify-center flex-col gap-16 md:gap-24 lg:gap-32 overflow-hidden">
      {/* Tood opcjonalne: Tu powinien być przycisk ustawień a w nim preferencje */}
      {/* Todo opcjonalne: Mini gra */}
      {/* Todo: Pokaż za pomocą procentów poprawność danych */}
      <div className="absolute top-3 right-4 md:right-3 flex items-center justify-center flex-row-reverse md:flex-col text-center group">
        <button onClick={() => updateAnimationPreference()}>
          <div className="w-fit h-fit flex items-center justify-center text-4xl text-black dark:text-white">
            {animationPreference ? (
              <MdAutoFixNormal title="Wyłącz animacje" />
            ) : (
              <MdAutoFixOff title="Włącz animacje" className="relative -left-[1.46px] -bottom-[1.46px] opacity-50" />
            )}
          </div>
        </button>
        <span className='w-24 relative top-0.5 -right-2 md:hidden text-xs md:text-sm md:opacity-0 md:group-hover:opacity-100 md:-translate-y-4 group-hover:translate-y-0 tranasition-all duration-300 delay-500 px-1 py-1'>
          <span className={`text-gray-600 dark:text-gray-200 opacity-50 md:opacity-100 ${colorsSmooth} pointer-events-none -z-10`}>
            Wyłącz/włącz animacje
          </span>
        </span>
      </div>
      {(animationPreference && animShowed == false) ? (
        <motion.div
          initial={{
            opacity: 0,
            translateY: 50,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
          className={`text-2xl md:text-3xl lg:text-5xl text-center text-black dark:text-white ${colorsSmooth}`}>
          Witam w
          <br />
          <b>AZ Essentials</b>
        </motion.div>
      ) : (
        <div
          className={`text-2xl md:text-3xl lg:text-5xl text-center text-black dark:text-white`}
        >
          Witam w
          <br />
          <b>AZ Essentials</b>
        </div>
      )}
      <div className="flex items-center flex-col gap-1 lg:gap-5">
        {(animationPreference && animShowed == false) ? (
          <motion.span
            initial={{
              opacity: -1,
              translateY: 50,
            }}
            animate={{
              opacity: 1,
              translateY: 0
            }}
            transition={{
              duration: 0.5,
              ease: "linear",
              delay: 0.75
            }}
            className={`text-black dark:text-white md:text-xl lg:text-2xl`}>
            Co chcesz zrobić?
          </motion.span>
        ) : (
          <span
            className={`text-black dark:text-white md:text-xl lg:text-2xl`}>
            Co chcesz zrobić?
          </span>
        )}
        <ul
          className={`flex flex-col md:flex-row gap-5 py-3 pr-1 ${colorsSmooth}`}>
          <Link href="d-w?sT=p">
            <ListEl icon={FaDoorOpen} mainTask="Wyświetl info o sali" taskDesc="Podaj numer sali, dzień i godzinę, aby sprawdzić, jakie zajęcia się odbędą." index={0} />
          </Link>
          <Link href="d-w?sT=t">
            <ListEl icon={FaPersonCircleQuestion} mainTask="Znajdź wykładowcę" taskDesc="Podaj imię, dzień i godzinę, aby zobaczyć, gdzie dany wykładowca ma zajęcia." index={1} />
          </Link>
          <Link href="k">
            <ListEl icon={FaCalendarDays} mainTask="Sprawdź plan zajęć" taskDesc="Wybierz kierunek i dzień, aby zobaczyć listę przyszłych zajęć." index={2} />
          </Link>
        </ul>
      </div>
      {(animationPreference && animShowed == false) ? (
        <motion.span
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: isLoading ? [0, 1, 0, 0.5] : 0.25
          }}
          transition={{
            duration: 2,
            ease: 'linear'
          }}
          className="absolute -bottom-0.5 md:bottom-1 text-gray-500 opacity-25">
          {isLoading && "Pobieranie danych..."}
          {!isLoading && data && "Dane pobrano pomyślnie."}
          {!isLoading && data === null && "Nie udało się pobrać danych."}
        </motion.span>
      ) : (
        <span
          className="absolute -bottom-0.5 md:bottom-1 text-gray-500 opacity-25">
          {isLoading && "Pobieranie danych..."}
          {!isLoading && data && "Dane pobrano pomyślnie."}
          {!isLoading && data === null && "Nie udało się pobrać danych."}
        </span>
      )}
    </div>
  );
}

export default Index;