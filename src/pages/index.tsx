import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataFetchContext';
import { MdAutoFixNormal, MdAutoFixOff, FaPersonCircleQuestion, FaCalendarDays, FaDoorOpen, FaCog, GoSun, GoMoon, FaTrashCan } from '@/assets/icons'
import { IconType } from "react-icons";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useDev } from "@/contexts/DevContext";
import { BsBookmarkCheckFill } from "react-icons/bs";
import ScheduleModal from "@/pages/ScheduleModal";
import Head from "next/head";
import { MajorTypes } from "@/types/type";

function Index() {
  const { data, fetchData } = useData()
  const { isDev, setIsDev } = useDev();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [animationPreference, setAnimationPreference] = useState<boolean>(true);
  const [animShowed, setAnimShowed] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const [showSaved, setShowSaved] = useState<boolean>(false);
  const [savedMajorSchedules, setSavedMajorSchedules] = useState<string[] | null>(null);
  const [chosenMajor, setChosenMajor] = useState<MajorTypes | undefined>(undefined);
  // const [devWidth, setDevWidth] = useState<number | null>(null);

  const colorsSmooth = "transition-colors duration-100";

  // get saved item
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (currentTheme !== "light") {
      setTheme(prefersDark ? "dark" : "light");
    }
    if (sessionStorage.getItem("azAnim")) {
      setAnimShowed(true)
    }
  }, [])

  useEffect(() => {
    const savedItem = localStorage.getItem("az-saved");
    if (savedItem) {
      setSavedMajorSchedules(JSON.parse(savedItem))
    }
    if (data) {
      setIsLoading(false)
    }
  }, [data])

  const handleAnimationEnd = () => {
    setAnimShowed(true);
    sessionStorage.setItem("azAnim", 'true');
  };

  function updateAnimationPreference() {
    const newAnimationPreference = !animationPreference;
    setAnimationPreference(newAnimationPreference);
    localStorage.setItem("az-anim", String(newAnimationPreference));
  }

  // fetching data, anim preference
  useEffect(() => {
    // console.clear();
    const animationPreference = localStorage.getItem("az-anim");

    if (animationPreference == 'false') {
      setAnimationPreference(false);
    } else {
      setAnimationPreference(true);
    }
    if (!data) {
      fetchData();
    } else {
      if (isDev) console.log("Dane istniały");
    }
  }, []);

  useEffect(() => {
    if (data) {
      if (isDev) console.log("Pobrano dane pomyślnie:", data);
    }
  }, [data])

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
            <Icon className={`text-2xl md:text-3xl text-black dark:text-white transition-colors duration-[2.25s] `} />
            <span className={`font-bold md:text-xl text-black dark:text-white transition-colors duration-[2.25s] `}>
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

  function getSavedMajors() {
    const interStyles = "hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-950 active:scale-95 transition-all"

    function removeSaved(major: string) {
      const saved = localStorage.getItem("az-saved")
      if (saved) {
        const parsedSaved: string[] = JSON.parse(saved)
        const updatedSaved = parsedSaved.filter(savedMajor => savedMajor !== major)
        setSavedMajorSchedules(updatedSaved)
        localStorage.setItem("az-saved", JSON.stringify(updatedSaved))
      }
    }

    if (showSaved) {
      if (!chosenMajor) {
        if (savedMajorSchedules?.length == 1) {
          const splitedMajor = savedMajorSchedules[0].split("&");
          const majorData = data?.find(major =>
            major.name == splitedMajor[0] &&
            major.year == splitedMajor[1] &&
            major.type == splitedMajor[2]
          );
          setChosenMajor(majorData)
          const returnToSavedMajorsMenu = () => {
            setChosenMajor(undefined)
          }
          if (majorData)
            return (
              <ScheduleModal returnToMenu={returnToSavedMajorsMenu} chosenMajorData={majorData} />
            )
        }
        return savedMajorSchedules?.map((major, index) => {
          const splitedMajor = major.split("&");
          const majorData = data?.find(major =>
            major.name == splitedMajor[0] &&
            major.year == splitedMajor[1] &&
            major.type == splitedMajor[2]
          );
          return (
            <button onClick={() => setChosenMajor(majorData)} key={index} className={`relative w-40 lg:w-52 shadow-[0px_2px_4px_1px_rgb(5,5,5)] rounded-lg lg:text-2xl py-1 px-2 text-black dark:text-white ${interStyles} group`}>
              {splitedMajor[0]}{" "}
              {splitedMajor[1]}{" "}
              {splitedMajor[2]}
              <FaTrashCan onClick={(e) => { e.stopPropagation(); removeSaved(major) }} className="w-10 h-10 p-2 absolute -right-2 -top-3 hidden group-hover:block pointer-events-none group-hover:pointer-events-auto hover:text-red-600 dark:hover:text-red-700 transition-shadow" />
            </button>
          );
        });
      } else {
        const returnToSavedMajorsMenu = () => {
          setChosenMajor(undefined)
        }
        return (
          <ScheduleModal returnToMenu={returnToSavedMajorsMenu} chosenMajorData={chosenMajor} />
        )
      }
    }
  }

  return (
    // Todo: Jeśli meta viewport nie zadziała przywróć h-[93vh]
    <div className="h-dvh flex items-center justify-between flex-col gap-16 md:gap-24 lg:gap-32 overflow-hidden">
      <Head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <title>AZ Essentials</title>
      </Head>
      {/* Todo opcjonalne: Mini gra */}
      {/* Todo: Pokaż za pomocą procentów poprawność danych */}
      <div className="w-10 self-end flex items-center flex-col gap-2">
        <FaCog onClick={() => setShowSettings(!showSettings)} title="Preferencje" className="text-3xl text-center cursor-pointer hover:rotate-180 transition-transform text-black dark:text-white" />
        {showSettings && (
          <ul className="flex items-center flex-col gap-2 dark:bg-gray-950/75 p-1 rounded-lg">
            <li onClick={() => updateAnimationPreference()}>
              {animationPreference ? (
                <MdAutoFixNormal title="Wyłącz animacje" className="relative -left-[1.1px] -bottom-[1.1px] text-4xl cursor-pointer text-black dark:text-white" />
              ) : (
                <MdAutoFixOff title="Włącz animacje" className="relative -left-[2.6px] -bottom-[2.6px] text-4xl cursor-pointer text-black dark:text-white" />
              )}
            </li>
            <li
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="cursor-pointer">
              {currentTheme === 'dark' ? (
                <GoSun title="Włącz jasny motyw" className="h-9 w-auto text-black dark:text-white hover:text-yellow-200 transition-colors duration-500" />
              ) : (
                <GoMoon title="Włącz ciemny motyw" className="h-9 w-auto text-black dark:text-white hover:text-blue-800 transition-colors duration-500" />
              )}
            </li>
          </ul>
        )}
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
          className={`text-2xl md:text-3xl lg:text-5xl text-center text-black dark:text-white ${colorsSmooth} select-none`}>
          Witam w
          <br />
          <b>AZ Essentials</b>
        </motion.div>
      ) : (
        <div
          className={`text-2xl md:text-3xl lg:text-5xl text-center text-black dark:text-white select-none`}>
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
            className={`text-black dark:text-white md:text-xl lg:text-2xl select-none`}>
            Co chcesz zrobić?
          </motion.span>
        ) : (
          <span
            className={`text-black dark:text-white md:text-xl lg:text-2xl select-none`}>
            Co chcesz zrobić?
          </span>
        )}
        <ul
          className={`flex flex-col md:flex-row gap-5 py-3 pr-1 ${colorsSmooth}`}>
          <Link href="d-w?t=p">
            <ListEl icon={FaDoorOpen} mainTask="Wyświetl info o sali" taskDesc="Podaj numer sali, dzień i godzinę, aby sprawdzić, jakie zajęcia się odbędą." index={0} />
          </Link>
          <Link href="d-w?t=t">
            <ListEl icon={FaPersonCircleQuestion} mainTask="Znajdź wykładowcę" taskDesc="Podaj imię, dzień i godzinę, aby zobaczyć, gdzie dany wykładowca ma zajęcia." index={1} />
          </Link>
          <Link href="k">
            <ListEl icon={FaCalendarDays} mainTask="Sprawdź plan zajęć" taskDesc="Wybierz kierunek i dzień, aby zobaczyć listę przyszłych zajęć." index={2} />
          </Link>
        </ul>
      </div>
      <footer className={`w-full flex items-center justify-between px-4`}>
        <span
          onDoubleClick={() => {
            setIsDev(!isDev); sessionStorage.setItem("azIsDev", `${!isDev}`); console.log("Tryb developera:", !isDev);
          }}
          className={`lg:text-xl leading-3 ${isLoading && "text-yellow-200 dark:text-yellow-900"} ${!isLoading && data && "text-green-200 dark:text-green-800"} ${!isLoading && data === null && "text-red-300 dark:text-red-900"} transition-colors duration-100`}>
          Beta
        </span>
        {savedMajorSchedules && <BsBookmarkCheckFill onClick={() => setShowSaved(() => !showSaved)} className=" text-3xl cursor-pointer z-10 text-black dark:text-white transition-colors duration-100" />
        }
      </footer>
      {showSaved && savedMajorSchedules && (
        <div onClick={() => setShowSaved(false)} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div onClick={(e) => e.stopPropagation()} className={`relative ${chosenMajor ? "h-[90%] min-w-[50%] justify-start" : "max-h-[90%] justify-center max-w-[90%] p-5"} items-center flex flex-col gap-4 bg-gray-200 dark:bg-gray-900 rounded-lg transition-colors duration-150 border-4 border-gray-400 dark:border-gray-800 ${isDev && "border border-black dark:border-white"}`}>
            {/* Todo: jeśli użytkownik zapisał tylko jeden plan to go defaultowo pokaż, jak nie to zmapuj */}
            {getSavedMajors()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;