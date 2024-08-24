import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.scss";
import HomeHero from "@/components/HomeHero";
import HomeListAll from "@/components/HomeListAll";
import AdSense from "@/components/AdSense";

// discord Invitation
import { useEffect } from "react";
import { toast } from "sonner";
import { FaDiscord, FaDonate } from "react-icons/fa";
import useDeviceSize from "@/Utils/useDeviceSize";
// discord Invitation

export default function Home() {
  // discord Invitation
 
  // discord Invitation
  return (
    <div className={styles.Home}>
      <HomeHero />
      <HomeListAll />
	<AdSense pId="ca-pub-9098691343505810"/>

    </div>
  );
}
