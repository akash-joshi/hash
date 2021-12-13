use std::{
    collections::{hash_map::Iter, HashMap},
    lazy::SyncOnceCell,
    sync::Arc,
};

use jspy::{js::JsInitTask, py::PyInitTask};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};

use super::PackageCreator;
use crate::{
    simulation::{
        enum_dispatch::*,
        package::{id::PackageIdGenerator, PackageMetadata, PackageType},
        Error, Result,
    },
    ExperimentConfig,
};

pub mod json;
pub mod jspy;

/// All init package names are registered in this enum
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Name {
    Json,
    JsPy,
}

impl std::fmt::Display for Name {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            serde_json::to_string(self).map_err(|_| std::fmt::Error)?
        )
    }
}

/// All init package tasks are registered in this enum
#[enum_dispatch(WorkerHandler, WorkerPoolHandler, GetTaskArgs)]
#[derive(Clone, Debug)]
pub enum InitTask {
    JsInitTask,
    PyInitTask,
}

/// All init package task messages are registered in this enum
#[enum_dispatch(RegisterWithoutTrait)]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum InitTaskMessage {
    JsPyInitTaskMessage,
}

pub struct PackageCreators(SyncOnceCell<HashMap<Name, Box<dyn PackageCreator>>>);

pub static PACKAGE_CREATORS: PackageCreators = PackageCreators(SyncOnceCell::new());

impl PackageCreators {
    pub(crate) fn initialize_for_experiment_run(
        &self,
        experiment_config: &Arc<ExperimentConfig>,
    ) -> Result<()> {
        log::debug!("Initializing Init Package Creators");
        use Name::*;
        let mut m = HashMap::new();
        m.insert(Json, json::Creator::new(experiment_config)?);
        m.insert(JsPy, jspy::Creator::new(experiment_config)?);
        self.0
            .set(m)
            .map_err(|_| Error::from("Failed to initialize Init Package Creators"))?;
        Ok(())
    }

    pub(crate) fn get_checked(&self, name: &Name) -> Result<&Box<dyn PackageCreator>> {
        Ok(self
            .0
            .get()
            .ok_or_else(|| Error::from("Init Package Creators weren't initialized"))?
            .get(name)
            .ok_or_else(|| {
                Error::from(format!(
                    "Package creator: {} wasn't within the Init Package Creators map",
                    name
                ))
            })?)
    }

    #[allow(dead_code)] // It is used in a test in deps.rs but the compiler fails to pick it up
    pub(crate) fn iter_checked(&self) -> Result<Iter<'_, Name, Box<dyn PackageCreator>>> {
        Ok(self
            .0
            .get()
            .ok_or_else(|| Error::from("Init Package Creators weren't initialized"))?
            .iter())
    }
}

lazy_static! {
    pub static ref METADATA: HashMap<Name, PackageMetadata> = {
        use Name::*;
        let mut id_creator = PackageIdGenerator::new(PackageType::Init);
        let mut m = HashMap::new();
        m.insert(Json, PackageMetadata {
            id: id_creator.next(),
            dependencies: json::Creator::dependencies(),
        });
        m.insert(JsPy, PackageMetadata {
            id: id_creator.next(),
            dependencies: jspy::Creator::dependencies(),
        });
        m
    };
}