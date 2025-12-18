declare module "*.svg" {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-snap-carousel' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface CarouselProps<T> {
    data: T[];
    renderItem: ({ item, index }: { item: T; index: number }) => JSX.Element;
    sliderWidth: number;
    itemWidth: number;
    loop?: boolean;
    autoplay?: boolean;
    autoplayInterval?: number;
    inactiveSlideScale?: number;
    inactiveSlideOpacity?: number;
  }

  export default class Carousel<T> extends Component<CarouselProps<T>> {}
}
