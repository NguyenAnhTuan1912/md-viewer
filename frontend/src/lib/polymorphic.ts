import * as React from 'react';

type TAsProp<T extends React.ElementType> = {
  as?: T;
};

type TPropsToOmit<T extends React.ElementType, P> = keyof (TAsProp<T> & P);

type TPolymorphicComponentProp<
  T extends React.ElementType,
  Props = {},
> = React.PropsWithChildren<Props & TAsProp<T>> &
  Omit<React.ComponentPropsWithoutRef<T>, TPropsToOmit<T, Props>>;

export type TPolymorphicRef<T extends React.ElementType> =
  React.ComponentPropsWithRef<T>['ref'];

type TPolymorphicComponentPropWithRef<
  T extends React.ElementType,
  Props = {},
> = TPolymorphicComponentProp<T, Props> & { ref?: TPolymorphicRef<T> };

export type TPolymorphicComponentPropsWithRef<
  T extends React.ElementType,
  P = {},
> = TPolymorphicComponentPropWithRef<T, P>;

export type TPolymorphicComponentProps<
  T extends React.ElementType,
  P = {},
> = TPolymorphicComponentProp<T, P>;

export type TPolymorphicComponent<P> = {
  <T extends React.ElementType>(
    props: TPolymorphicComponentPropsWithRef<T, P>,
  ): React.ReactNode;
};
