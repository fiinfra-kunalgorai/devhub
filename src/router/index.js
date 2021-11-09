import React, { Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import dlv from 'dlv';
import { useConfig } from '../provider/config';
import { useScreenAndLayout } from '../provider/screen-layout';
import { composeComponents } from '../utils/component';
import { exists } from '../utils/basics';
import { getConfigResource } from '../utils/resource-path';

/**
 * Component `DescriptorLoader` is a thin wrapper that wraps around every screen component given for a route.
 * This wrapper generalizes the idea of downloading screen specific config `descriptor` file.
 
 * @param {string} descriptor - descriptor file name
 * @param {Object} children - `Screen` component for that specific `url`.
 * @returns - Wrapped component for `Screen` with downloaded `descriptor` passed as prop to `Screen`.
 */
const DescriptorLoader = ({ descriptor, children }) => {
    const [desc, setDesc] = React.useState(null);

    React.useEffect(() => {
        fetch(getConfigResource(descriptor))
            .then(d => d.json())
            .then(d => setDesc(d))
            .catch(e => console.log(`Error downloading descriptor ${descriptor} due to: ${e}`));
    }, []);

    return desc && React.cloneElement(
        React.Children.only(children),
        { descriptor: desc }
    );
}

export default function Router() {
    const { genericInfo = {}, routes = [] } = useConfig();
    const screenAndLayout = useScreenAndLayout();

    return composeComponents(
        BrowserRouter,
        Switch,
        [Suspense, { fallback: <div>Loading app...</div> }]
    )(
        routes.map(({ path, descriptor, screen, layout }, key) => {
            const Screen = dlv(screenAndLayout, `screens.${screen}`, null);
            const Layout = dlv(screenAndLayout, `layouts.${layout}`, null);

            if (!exists(Screen) || !exists(Layout)) return;

            return composeComponents(
                [Route, { key: `route-${key}`, path, exact: true }],
                descriptor && [DescriptorLoader, { descriptor }] // Wrap `DescriptorLoader` only if `descriptor` is found for a given screen.
            )(<Screen genericInfo={genericInfo} Layout={Layout} />);
        })
    );
}