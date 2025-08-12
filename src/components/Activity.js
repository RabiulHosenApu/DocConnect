import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { gsap, Power2, Elastic, AutoKillTweens } from 'gsap-rn';

const Activity = () => {
  const circles = useRef([]);
  const tl = useRef();

  useEffect(() => {
    const animate = () => {
      AutoKillTweens.tweensOf(tl.current); // Stop any ongoing tweens
      tl.current = gsap.timeline();

      tl.current.to(circles.current, {
        duration: 0.01,              // faster scale up
        transform: { scale: 1.5 },
        ease: Power2.easeInOut,
        stagger: { amount: 0.15 },  // faster stagger
      })
      .to(circles.current, {
        duration: 0.01,              // faster scale down
        transform: { scale: 0.5 },
        ease: Elastic.easeOut,
        stagger: { amount: 0.15 },
      })
      .to(circles.current, {
        duration: 0.01,              // faster scale back
        transform: { scale: 1.5 },
        ease: Power2.easeInOut,
        stagger: { amount: 0.15 },
      });
    };

    animate(); 

    const intervalId = setInterval(animate, 800); // repeat every 0.8 seconds instead of 2s

    return () => {
      clearInterval(intervalId);
      if (tl.current) {
        tl.current.kill();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <AutoKillTweens tweens={tl.current} />
      <View style={styles.circlesContainer}>
        <View ref={ref => circles.current.push(ref)} style={styles.circle} />
        <View ref={ref => circles.current.push(ref)} style={styles.circle} />
        <View ref={ref => circles.current.push(ref)} style={styles.circle} />
      </View>
      <View style={styles.textView}>
        <Text style={styles.text}>Please Wait...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  circle: {
    width: 10,
    height: 10,
    backgroundColor: '#007bff',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  textView: {
    alignSelf: 'center',
    marginTop: 10,
  },
  text: {
    fontSize: 18,
    color: 'gray',
  },
});

export default Activity;
